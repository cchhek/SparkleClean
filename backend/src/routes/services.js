const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ==========================================
// CUSTOMER & PUBLIC ROUTES
// ==========================================

// Get all active services
router.get('/', async (req, res, next) => {
  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: { price: 'asc' }
    });
    res.json(services);
  } catch (error) {
    next(error);
  }
});

// Get all addons
router.get('/addons', async (req, res, next) => {
  try {
    const addons = await prisma.addon.findMany({
      orderBy: { price: 'asc' }
    });
    res.json(addons);
  } catch (error) {
    next(error);
  }
});

// ==========================================
// ADMIN ROUTES
// ==========================================

// Add a new service
router.post('/', authenticateToken, isAdmin, async (req, res, next) => {
  try {
    const { name, description, price, duration, image } = req.body;

    if (!name || !description || price === undefined || duration === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
        image: image || null
      }
    });

    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
});

// Update an existing service
router.put('/:id', authenticateToken, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration, image, active } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = parseFloat(price);
    if (duration !== undefined) data.duration = parseInt(duration);
    if (image !== undefined) data.image = image;
    if (active !== undefined) data.active = active;

    const service = await prisma.service.update({
      where: { id },
      data
    });

    res.json(service);
  } catch (error) {
    next(error);
  }
});

// Delete a service (Soft delete by setting active to false)
router.delete('/:id', authenticateToken, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Hard delete or soft delete? Let's check bookings
    const bookingsCount = await prisma.booking.count({
      where: { serviceId: id }
    });

    if (bookingsCount > 0) {
      // Soft delete if bookings exist to preserve database integrity
      const service = await prisma.service.update({
        where: { id },
        data: { active: false }
      });
      return res.json({ message: 'Service has active bookings. Soft deleted successfully.', service });
    }

    await prisma.service.delete({
      where: { id }
    });

    res.json({ message: 'Service deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

// Add a new addon
router.post('/addons', authenticateToken, isAdmin, async (req, res, next) => {
  try {
    const { name, price, description } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    const addon = await prisma.addon.create({
      data: {
        name,
        price: parseFloat(price),
        description: description || null
      }
    });

    res.status(201).json(addon);
  } catch (error) {
    next(error);
  }
});

// Update an addon
router.put('/addons/:id', authenticateToken, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price, description } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (price !== undefined) data.price = parseFloat(price);
    if (description !== undefined) data.description = description;

    const addon = await prisma.addon.update({
      where: { id },
      data
    });

    res.json(addon);
  } catch (error) {
    next(error);
  }
});

// Delete an addon
router.delete('/addons/:id', authenticateToken, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.addon.delete({
      where: { id }
    });
    res.json({ message: 'Addon deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
