const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary
cloudinary.config({
  cloud_name: "du5jkj6pi",
  api_key: "857282271768656",
  api_secret: "uDwmDPQ8rEjWiGNsWkElruxbDhk",
});

// Configure Multer-Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "FriendSphere", // Optional: specify folder in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg"], // Specify file formats
  },
});

module.exports =  storage ;