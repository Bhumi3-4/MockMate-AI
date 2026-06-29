const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  generateQuestions,
  getMyInterviewSets,
  getInterviewSetById,
  submitAnswer,
  completeInterview,
  getAnalyticsSummary,
} = require("../controllers/interviewController");

const router = express.Router();

router.post("/generate", protect, generateQuestions);
router.get("/analytics/summary", protect, getAnalyticsSummary);
router.get("/", protect, getMyInterviewSets);
router.get("/:id", protect, getInterviewSetById);
router.put("/:id/answer", protect, submitAnswer);
router.put("/:id/complete", protect, completeInterview);

module.exports = router;