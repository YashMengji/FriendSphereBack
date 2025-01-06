const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer"); // Middleware for handling file uploads
require("dotenv").config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Configure Multer-Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "FriendSphere", // Optional: specify folder in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg"], // Specify file formats
  },
});

const upload = multer({ storage: storage });

module.exports =  upload;