const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (filePath, folder = 'general') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `blue-tomato/${folder}`,
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true,
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
      type: result.resource_type,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload to Cloudinary');
  }
};

const uploadBase64 = async (base64String, folder = 'general') => {
  try {
    const result = await cloudinary.uploader.upload(base64String, {
      folder: `blue-tomato/${folder}`,
      resource_type: 'auto',
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
      type: result.resource_type,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload to Cloudinary');
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return { success: true };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete from Cloudinary');
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  uploadBase64,
  deleteFromCloudinary,
};