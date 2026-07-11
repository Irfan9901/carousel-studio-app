const express = require('express');
const { get, set } = require('../../lib/db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

const IMAGE_KEY = 'categoryImages';

// GET /api/category-images — ambil semua gambar kategori
router.get('/', async (req, res) => {
  try {
    const images = await get(IMAGE_KEY) || {};
    res.json({ images });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/category-images/:styleId — upload/ganti gambar (admin only)
router.put('/:styleId', requireAdmin, async (req, res) => {
  try {
    const { styleId } = req.params;
    const { imageData } = req.body;
    if (!imageData || typeof imageData !== 'string') {
      return res.status(400).json({ error: 'imageData (base64 data URL) required' });
    }
    if (!imageData.startsWith('data:image/')) {
      return res.status(400).json({ error: 'imageData must start with data:image/' });
    }
    // check size (~5MB limit for base64 string)
    const sizeBytes = Math.round(imageData.length * 0.75);
    if (sizeBytes > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image too large (max 5MB)' });
    }

    const images = await get(IMAGE_KEY) || {};
    images[styleId] = imageData;
    await set(IMAGE_KEY, images);
    res.json({ success: true, styleId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/category-images/:styleId — hapus gambar (admin only)
router.delete('/:styleId', requireAdmin, async (req, res) => {
  try {
    const { styleId } = req.params;
    const images = await get(IMAGE_KEY) || {};
    if (images[styleId]) {
      delete images[styleId];
      await set(IMAGE_KEY, images);
    }
    res.json({ success: true, styleId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
