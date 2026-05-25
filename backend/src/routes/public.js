const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const AppConfig = require('../models/AppConfig');

// ── Public Banners API ──────────────────────────────

router.get('/banners', async (req, res) => {
  try {
    const { app } = req.query;
    const now = new Date();
    const query = {
      isActive: true,
      $or: [{ targetApp: app }, { targetApp: 'both' }],
      $or: [
        { startDate: null, endDate: null },
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { startDate: { $lte: now }, endDate: null },
        { startDate: null, endDate: { $gte: now } },
      ],
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
