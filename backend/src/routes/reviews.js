const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get approved reviews for display on website
router.get('/', async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { approved: true },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
});

// Admin: Get all reviews (including pending/unapproved)
router.get('/all', async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
});

// Submit a new customer review
router.post('/', async (req, res, next) => {
  try {
    const { name, serviceName, rating, comment } = req.body;

    if (!name || !comment) {
      return res.status(400).json({ message: 'Name and review comment are required' });
    }

    const review = await prisma.review.create({
      data: {
        name: name.trim(),
        serviceName: serviceName || 'Home Cleaning',
        rating: Math.min(Math.max(parseInt(rating) || 5, 1), 5),
        comment: comment.trim(),
        approved: true // Auto-publish for immediate customer satisfaction
      }
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback!',
      review
    });
  } catch (error) {
    next(error);
  }
});

// Admin: Toggle approval status
router.put('/:id/approve', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    const updated = await prisma.review.update({
      where: { id },
      data: { approved: Boolean(approved) }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Admin: Delete review
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.review.delete({ where: { id } });
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
