const cloudinary = require('../config/cloudinary');

const extractPublicId = (url) => {
  const match = url.match(/placepulse-updated\/([^/.]+)/);
  return match ? `placepulse-updated/${match[1]}` : null;
};

const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.log('Failed to clean up orphaned Cloudinary image:', err);
  }
};

module.exports = { deleteCloudinaryImage, extractPublicId };