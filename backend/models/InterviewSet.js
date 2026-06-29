const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  score: { type: Number, min: 0, max: 10 },
  strengths: [String],
  weaknesses: [String],
  suggestions: [String],
});

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  category: { type: String, default: "general" },
  answerText: { type: String, default: "" },
  answeredAt: { type: Date },
  feedback: feedbackSchema,
});

const interviewSetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobRole: { type: String, required: true },
    experienceLevel: { type: String, required: true },
    questions: [questionSchema],
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },
    overallScore: { type: Number, min: 0, max: 10 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InterviewSet", interviewSetSchema);