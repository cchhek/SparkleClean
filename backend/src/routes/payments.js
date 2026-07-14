const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { sendBookingConfirmation } = require('../utils/mailer');

const router = express.Router();
const prisma = new PrismaClient();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const isStripeConfigured = !!STRIPE_SECRET_KEY && STRIPE_SECRET_KEY !== 'your_stripe_secret_key';

let stripe;
if (isStripeConfigured) {
  stripe = require('stripe')(STRIPE_SECRET_KEY);
} else {
  console.log('payments.js: Stripe secret key missing or placeholder. Running in Mock Stripe Mode.');
}

// Create a Stripe checkout session (or Mock Session)
router.post('/create-checkout-session', async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: 'Booking ID is required' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        addons: {
          include: { addon: true }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // ----------------------------------------------------
    // MOCK MODE FALLBACK
    // ----------------------------------------------------
    if (!isStripeConfigured) {
      const mockSessionId = `mock_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const mockCheckoutUrl = `${frontendUrl}/payment-success?session_id=${mockSessionId}&booking_id=${bookingId}`;

      return res.json({
        id: mockSessionId,
        url: mockCheckoutUrl,
        isMock: true
      });
    }

    // ----------------------------------------------------
    // STRIPE LIVE MODE
    // ----------------------------------------------------
    // Prepare line items
    const lineItems = [
      {
        price_data: {
          currency: 'aud',
          product_data: {
            name: `${booking.service.name} (${booking.propertyType} - ${booking.bedrooms} Bed, ${booking.bathrooms} Bath)`,
            description: `Base Price + Property Config`
          },
          unit_amount: Math.round(
            (booking.totalPrice - booking.addons.reduce((sum, item) => sum + item.addon.price, 0)) * 100
          )
        },
        quantity: 1
      }
    ];

    // Add addons to checkout items
    booking.addons.forEach(item => {
      lineItems.push({
        price_data: {
          currency: 'aud',
          product_data: {
            name: `Addon: ${item.addon.name}`,
            description: item.addon.description || ''
          },
          unit_amount: Math.round(item.addon.price * 100)
        },
        quantity: 1
      });
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${frontendUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
      cancel_url: `${frontendUrl}/booking?cancelled=true&booking_id=${bookingId}`,
      customer_email: booking.customerEmail,
      metadata: {
        bookingId: booking.id,
        bookingRef: booking.bookingRef
      }
    });

    res.json({
      id: session.id,
      url: session.url,
      isMock: false
    });
  } catch (error) {
    next(error);
  }
});

// Verify session status and finalize booking
router.post('/verify-checkout-session', async (req, res, next) => {
  try {
    const { sessionId, bookingId } = req.body;

    if (!sessionId || !bookingId) {
      return res.status(400).json({ message: 'Session ID and Booking ID are required' });
    }

    // Retrieve booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
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

    // Check if booking is already confirmed and paid
    if (booking.status === 'CONFIRMED' && booking.payment && booking.payment.status === 'PAID') {
      return res.json({
        success: true,
        message: 'Booking already verified and confirmed.',
        booking
      });
    }

    let isPaid = false;
    let paymentAmount = booking.totalPrice;

    if (sessionId.startsWith('mock_session_')) {
      // Mock mode validation
      isPaid = true;
    } else if (isStripeConfigured) {
      // Retrieve session from Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === 'paid') {
        isPaid = true;
        paymentAmount = session.amount_total / 100;
      }
    }

    if (isPaid) {
      // 1. Create or update Payment record
      await prisma.payment.upsert({
        where: { bookingId },
        update: {
          stripeSessionId: sessionId,
          amount: paymentAmount,
          status: 'PAID'
        },
        create: {
          bookingId,
          stripeSessionId: sessionId,
          amount: paymentAmount,
          status: 'PAID'
        }
      });

      // 2. Update Booking Status
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED' },
        include: {
          service: true,
          addons: {
            include: { addon: true }
          }
        }
      });

      // 3. Send Booking Confirmation Email
      const addonList = updatedBooking.addons.map(a => a.addon);
      await sendBookingConfirmation(updatedBooking, updatedBooking.service.name, addonList);

      return res.json({
        success: true,
        message: 'Payment verified and booking confirmed.',
        booking: updatedBooking
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. The payment has not been completed.'
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
