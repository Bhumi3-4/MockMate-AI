const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "resumes",
    resource_type: "auto", // allows pdf/doc, not just images
    allowed_formats: ["pdf", "doc", "docx"],
  },
});

const upload = multer({ storage });

module.exports = upload;