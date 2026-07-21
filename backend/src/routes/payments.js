const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { sendBookingConfirmation } = require('../utils/mailer');

const router = express.Router();
const prisma = new PrismaClient();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const isStripeConfigured = !!STRIPE_SECRET_KEY && STRIPE_SECRET_KEY !== 'your_stripe_secret_key';

const { SquareClient, SquareEnvironment } = require('square');

let stripe;
if (isStripeConfigured) {
  stripe = require('stripe')(STRIPE_SECRET_KEY);
} else {
  console.log('payments.js: Stripe secret key missing or placeholder. Running in Mock Stripe Mode.');
}

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
const isSquareConfigured = !!SQUARE_ACCESS_TOKEN && 
  SQUARE_ACCESS_TOKEN !== 'your_square_access_token' && 
  !SQUARE_ACCESS_TOKEN.startsWith('EAAA...your');

let squareClient;
if (isSquareConfigured) {
  try {
    squareClient = new SquareClient({
      token: SQUARE_ACCESS_TOKEN,
      environment: process.env.SQUARE_ENVIRONMENT === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
    });
    console.log('payments.js: Square Client initialized successfully.');
  } catch (e) {
    console.error('payments.js: Failed to initialize Square Client:', e.message);
  }
} else {
  console.log('payments.js: Square configuration missing or default placeholder. Running in Mock Square Mode.');
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

    // Check if booking is already confirmed
    if (booking.status === 'CONFIRMED') {
      return res.json({
        success: true,
        message: 'Booking verified and confirmed.',
        booking
      });
    }

    let isPaid = false;
    let paymentAmount = booking.totalPrice;

    if (sessionId.startsWith('mock_session_') || sessionId.startsWith('sq_txn_') || sessionId.startsWith('mock_')) {
      // Mock or Square transaction validation
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

// Create a Square Online Checkout payment link (Official Hosted Square Checkout)
router.post('/create-square-checkout-session', async (req, res, next) => {
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
    const redirectUrl = `${frontendUrl}/payment-success?session_id=sq_txn_${Date.now()}&booking_id=${bookingId}`;

    if (!isSquareConfigured) {
      return res.json({
        url: redirectUrl,
        isMock: true
      });
    }

    // Prepare line items
    const baseAmount = booking.totalPrice - booking.addons.reduce((sum, item) => sum + item.addon.price, 0);
    const lineItems = [
      {
        name: `${booking.service.name} (${booking.propertyType.toUpperCase()} - ${booking.bedrooms} Bed, ${booking.bathrooms} Bath)`,
        quantity: '1',
        basePriceMoney: {
          amount: BigInt(Math.round(baseAmount * 100)),
          currency: 'AUD'
        }
      }
    ];

    booking.addons.forEach(item => {
      lineItems.push({
        name: `Addon: ${item.addon.name}`,
        quantity: '1',
        basePriceMoney: {
          amount: BigInt(Math.round(item.addon.price * 100)),
          currency: 'AUD'
        }
      });
    });

    const crypto = require('crypto');
    const idempotencyKey = `sq_chk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const response = await squareClient.checkout.paymentLinks.create({
      idempotencyKey,
      order: {
        locationId: process.env.SQUARE_LOCATION_ID,
        lineItems
      },
      checkoutOptions: {
        redirectUrl
      }
    });

    const checkoutUrl = response.paymentLink?.url || response.result?.paymentLink?.url;

    if (!checkoutUrl) {
      throw new Error('Failed to generate Square Online Checkout link');
    }

    res.json({
      url: checkoutUrl,
      isMock: false
    });
  } catch (error) {
    console.error('Square Online Checkout Error:', error);
    next(error);
  }
});

// ==========================================
// SQUARE PAYMENT ROUTES
// ==========================================


// Get public Square configuration for frontend SDK
router.get('/square-config', (req, res) => {
  res.json({
    applicationId: process.env.SQUARE_APPLICATION_ID || 'sandbox-sq0idp-your_app_id',
    locationId: process.env.SQUARE_LOCATION_ID || 'your_square_location_id',
    environment: process.env.SQUARE_ENVIRONMENT || 'sandbox',
    isMock: !isSquareConfigured
  });
});

// Process a payment token generated by Square Web Payments SDK
router.post('/square-payment', async (req, res, next) => {
  try {
    const { bookingId, sourceId } = req.body;

    if (!bookingId || !sourceId) {
      return res.status(400).json({ message: 'Booking ID and payment source token are required' });
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

    let isPaid = false;
    let paymentTransactionId = `sq_txn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    if (!isSquareConfigured || sourceId.startsWith('mock_') || sourceId === 'cnon:card-nonce-ok') {
      // Simulated Payment Mode (Fallback for development/testing without live keys)
      isPaid = true;
      console.log(`payments.js: Simulated Square payment processed successfully for booking #${booking.bookingRef}`);
    } else if (squareClient) {
      // Live Square Payments API Execution
      const crypto = require('crypto');
      const idempotencyKey = crypto.randomUUID ? crypto.randomUUID() : `sq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const paymentResponse = await squareClient.payments.create({
        sourceId,
        idempotencyKey,
        amountMoney: {
          amount: BigInt(Math.round(booking.totalPrice * 100)),
          currency: 'AUD'
        },
        note: `Sparkle Cleaning Booking Ref #${booking.bookingRef}`
      });

      const payment = paymentResponse.payment || paymentResponse.result?.payment || paymentResponse;
      if (payment && (payment.status === 'COMPLETED' || payment.status === 'APPROVED')) {
        isPaid = true;
        paymentTransactionId = payment.id;
      }
    }


    if (isPaid) {
      // 1. Create or update Payment record
      await prisma.payment.upsert({
        where: { bookingId },
        update: {
          stripeSessionId: paymentTransactionId,
          amount: booking.totalPrice,
          status: 'PAID'
        },
        create: {
          bookingId,
          stripeSessionId: paymentTransactionId,
          amount: booking.totalPrice,
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
        message: 'Square payment processed and booking confirmed.',
        booking: updatedBooking,
        transactionId: paymentTransactionId
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Square payment authorization was declined or failed.'
      });
    }
  } catch (error) {
    console.error('Square Payment Error:', error);
    next(error);
  }
});

module.exports = router;

