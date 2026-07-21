const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get page content values for a specific page or all pages
router.get('/', async (req, res, next) => {
  try {
    const { sitePage } = req.query;
    const where = sitePage ? { page: sitePage } : {};
    const contentRows = await prisma.pageContent.findMany({ where });

    if (sitePage) {
      const pageContent = contentRows.reduce((acc, row) => ({
        ...acc,
        [row.key]: row.value
      }), {});
      return res.json(pageContent);
    }

    const grouped = contentRows.reduce((acc, row) => {
      if (!acc[row.page]) acc[row.page] = {};
      acc[row.page][row.key] = row.value;
      return acc;
    }, {});

    res.json(grouped);
  } catch (error) {
    next(error);
  }
});

// Update page content for a specific page
router.put('/', authenticateToken, isAdmin, async (req, res, next) => {
  try {
    const { page, values } = req.body;
    if (!page || !values || typeof values !== 'object') {
      return res.status(400).json({ message: 'Invalid page content payload' });
    }

    const savedRows = [];
    for (const [key, value] of Object.entries(values)) {
      const row = await prisma.pageContent.upsert({
        where: { key },
        create: { page, key, value: value || '' },
        update: { value: value || '' }
      });
      savedRows.push(row);
    }

    res.json({ message: 'Page content saved', content: savedRows });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
