const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary credentials
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});


// Set up multer-storage-cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'wanderLust_DEV',            // Folder name in your Cloudinary account
    allowed_formats: ['png', 'jpg', 'jpeg'], // ✅ use snake_case
  },
});

module.exports = {
  cloudinary,
  storage
};
