const express = require('express');
const { uploadBase64 } = require('../utils/cloudinary');

const router = express.Router();

router.post('/upload-base64', async (req, res) => {
  try {
    const { image, folder } = req.body;
    if (!image) {
      return res.status(400).json({ message: 'Image data is required' });
    }

    const result = await uploadBase64(image, folder || 'general');
    res.json({
      message: 'File uploaded successfully',
      url: result.url,
      publicId: result.publicId,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload file', error: error.message });
  }
});

module.exports = router;