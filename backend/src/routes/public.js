const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const AppConfig = require('../models/AppConfig');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');

// ── Public Categories API ───────────────────────────

router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get categories', error: error.message });
  }
});

router.get('/subcategories', async (req, res) => {
  try {
    const { categoryId } = req.query;
    const query = { isActive: true };
    if (categoryId) query.category = categoryId;
    const subcategories = await Subcategory.find(query).sort({ createdAt: -1 });
    res.json({ subcategories });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get subcategories', error: error.message });
  }
});

// ── Public Banners API ──────────────────────────────

router.get('/banners', async (req, res) => {
  try {
    const { app } = req.query;
    const now = new Date();
    
    const conditions = [];
    if (app) {
      conditions.push({ $or: [{ targetApp: app }, { targetApp: 'both' }] });
    }
    conditions.push({
      $or: [
        { startDate: null, endDate: null },
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { startDate: { $lte: now }, endDate: null },
        { startDate: null, endDate: { $gte: now } },
      ],
    });

    const query = {
      isActive: true,
      $and: conditions,
    };

    const banners = await Banner.find(query)
      .select('-createdBy')
      .sort({ sortOrder: 1, createdAt: -1 });

    res.json({ banners });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get banners', error: error.message });
  }
});

// ── Public App Config / Theme API ───────────────────

router.get('/theme/:appType', async (req, res) => {
  try {
    const { appType } = req.params;
    let config = await AppConfig.findOne({ appType });
    if (!config) {
      config = await AppConfig.create({ appType });
    }
    res.json({
      colors: config.colors,
      fontFamily: config.fontFamily,
      logo: config.logo,
      logoWhite: config.logoWhite,
      splashImage: config.splashImage,
      features: config.features,
      layout: config.layout,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get theme', error: error.message });
  }
});

module.exports = router;
