const User = require("../models/User");

// Update profile (job role, experience level)
// =>route PUT /api/users/profile
// =>access Private
const updateProfile = async (req, res) => {
  try {
    const { jobRole, experienceLevel } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.jobRole = jobRole || user.jobRole;
    user.experienceLevel = experienceLevel || user.experienceLevel;

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  Upload resume
// =>route POST /api/users/resume
// =>access Private
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user._id);
    user.resumeUrl = req.file.path; // Cloudinary URL
    await user.save();

    res.status(200).json({ resumeUrl: user.resumeUrl });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { updateProfile, uploadResume };