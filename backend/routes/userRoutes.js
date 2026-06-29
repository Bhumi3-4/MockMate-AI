const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { updateProfile, uploadResume } = require("../controllers/userController");

const router = express.Router();

router.put("/profile", protect, updateProfile);
router.post("/resume", protect, upload.single("resume"), uploadResume);

module.exports = router;