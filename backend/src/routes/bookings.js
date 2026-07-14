const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Helper to generate a unique booking reference (e.g., SPARK-123456)
function generateBookingRef() {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `SPK-${num}`;
}

// Helper to calculate total price
async function calculatePrice(serviceId, propertyType, bedrooms, bathrooms, addonIds) {
  const service = await prisma.service.findUnique({
    where: { id: serviceId }
  });
  if (!service) throw new Error('Service not found');

  let total = service.price;

  // Add bedroom pricing (+ $15 per bedroom after the first)
  if (bedrooms > 1) {
    total += (bedrooms - 1) * 15;
  }

  // Add bathroom pricing (+ $25 per bathroom after the first)
  if (bathrooms > 1) {
    total += (bathrooms - 1) * 25;
  }

  // House extra cost
  if (propertyType.toUpperCase() === 'HOUSE') {
    total += 20;
  }

  // Add addons pricing
  if (addonIds && addonIds.length > 0) {
    const addons = await prisma.addon.findMany({
      where: { id: { in: addonIds } }
    });
    const addonsTotal = addons.reduce((sum, item) => sum + item.price, 0);
    total += addonsTotal;
  }

  return total;
}

// ==========================================
// PUBLIC / CUSTOMER ROUTES
// ==========================================

// Get unavailable dates/times to prevent double booking
// Returns an array of { date: 'YYYY-MM-DD', timeSlot: '09:00 - 11:00' }
router.get('/unavailable-slots', async (req, res, next) => {
  try {
    const { date } = req.query;

    const whereClause = {
      // Exclude cancelled bookings when checking capacity
      status: { not: 'CANCELLED' }
    };

    if (date) {
      const queryDate = new Date(date);
      const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));
      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      select: {
        date: true,
        timeSlot: true
      }
    });

    // Format dates to YYYY-MM-DD
    const slots = bookings.map(b => ({
      date: b.date.toISOString().split('T')[0],
      timeSlot: b.timeSlot
    }));

    res.json(slots);
  } catch (error) {
    next(error);
  }
});

// Create a booking request (prior to payment)
router.post('/', async (req, res, next) => {
  try {
    const {
      serviceId,
      propertyType,
      bedrooms,
      bathrooms,
      date,
      timeSlot,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      addonIds // Array of addon IDs
    } = req.body;

    if (!serviceId || !propertyType || !bedrooms || !bathrooms || !date || !timeSlot || !customerName || !customerEmail || !customerPhone || !customerAddress) {
      return res.status(400).json({ message: 'Missing required booking fields' });
    }

    // Verify time slot is not already booked
    const bookingDate = new Date(date);
    const startOfDay = new Date(new Date(date).setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(date).setHours(23, 59, 59, 999));

    const existingBooking = await prisma.booking.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        timeSlot,
        status: { not: 'CANCELLED' }
      }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'This time slot has already been booked. Please choose another date or time.' });
    }

    // Calculate final price securely
    const totalPrice = await calculatePrice(serviceId, propertyType, parseInt(bedrooms), parseInt(bathrooms), addonIds);

    const bookingRef = generateBookingRef();

    // Create booking in database
    const booking = await prisma.booking.create({
      data: {
        bookingRef,
        serviceId,
        propertyType,
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        date: bookingDate,
        timeSlot,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        totalPrice,
        status: 'PENDING',
        addons: {
          create: (addonIds || []).map(id => ({
            addon: { connect: { id } }
          }))
        }
      },
      include: {
        addons: {
          include: { addon: true }
        },
        service: true
      }
    });

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
});

// ==========================================
// ADMIN ROUTES
// ==========================================

// Get all bookings (with optional filters)
router.get('/', authenticateToken, isAdmin, async (req, res, next) => {
  try {
    const { status, search } = req.query;

    const whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { bookingRef: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } }
      ];
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        service: true,
        addons: {
          include: { addon: true }
        },
        payment: true
      },
      orderBy: { date: 'desc' }
    });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
});

// Get single booking details
router.get('/:id', authenticateToken, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: true,
        addons: {
          include: { addon: true }
        },
        payment: true
      }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
});

// Update booking status
router.put('/:id/status', authenticateToken, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid booking status' });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        service: true,
        addons: {
          include: { addon: true }
        }
      }
    });

    res.json(booking);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
