const model = require("../config/gemini");
const InterviewSet = require("../models/InterviewSet");

// Generate interview questions using AI
// route=> POST /api/interviews/generate
// access=> Private

console.log("DEBUG KEY:", JSON.stringify(process.env.GEMINI_API_KEY));
const generateQuestions = async (req, res) => {
  try {
    const { jobRole, experienceLevel, numQuestions } = req.body;

    if (!jobRole || !experienceLevel) {
      return res.status(400).json({ message: "Job role and experience level are required" });
    }

    const count = numQuestions || 5;

    const prompt = `You are an expert technical interviewer.
Generate ${count} interview questions for a candidate applying for the role of "${jobRole}" with "${experienceLevel}" experience level.
Mix technical and behavioral questions.
Return ONLY a valid JSON array, no markdown, no extra text, in this exact format:
[
  { "questionText": "...", "category": "technical" },
  { "questionText": "...", "category": "behavioral" }
]`;

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    // Clean potential markdown code fences Gemini sometimes adds
    const cleanText = rawText.replace(/```json|```/g, "").trim();

    let questions;
    try {
      questions = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", rawText);
      return res.status(500).json({ message: "AI returned invalid format, please try again" });
    }

    const interviewSet = await InterviewSet.create({
      user: req.user._id,
      jobRole,
      experienceLevel,
      questions,
    });

    res.status(201).json(interviewSet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  Get all interview sets for logged-in user
// route=> GET /api/interviews
// access=> Private
const getMyInterviewSets = async (req, res) => {
  try {
    const sets = await InterviewSet.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(sets);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  Get one interview set by ID
// route GET /api/interviews/:id
// access Private
const getInterviewSetById = async (req, res) => {
  try {
    const set = await InterviewSet.findById(req.params.id);
    if (!set) return res.status(404).json({ message: "Not found" });

    if (set.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json(set);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  Submit/update an answer for a specific question in an interview set
// route PUT /api/interviews/:id/answer
// access Private
const submitAnswer = async (req, res) => {
  try {
    const { questionId, answerText } = req.body;

    const set = await InterviewSet.findById(req.params.id);
    if (!set) return res.status(404).json({ message: "Interview set not found" });

    if (set.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const question = set.questions.id(questionId);
    if (!question) return res.status(404).json({ message: "Question not found" });

    question.answerText = answerText;
    question.answeredAt = new Date();

    if (set.status === "pending") set.status = "in_progress";

    await set.save();

    res.status(200).json(set);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  Mark an interview set as completed
// route PUT /api/interviews/:id/complete
// access Private
const completeInterview = async (req, res) => {
  try {
    const set = await InterviewSet.findById(req.params.id);
    if (!set) return res.status(404).json({ message: "Interview set not found" });

    if (set.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    for (const question of set.questions) {
      if (!question.answerText || question.answerText.trim() === "") continue;

      const prompt = `You are an expert interview coach evaluating a candidate's answer.

Question: "${question.questionText}"
Candidate's Answer: "${question.answerText}"
Job Role: ${set.jobRole}
Experience Level: ${set.experienceLevel}

Evaluate the answer and return ONLY valid JSON, no markdown, no extra text, in this exact format:
{
  "score": 7,
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "suggestions": ["...", "..."]
}
Score must be an integer from 0 to 10.`;

      try {
        const result = await model.generateContent(prompt);
        const rawText = result.response.text();
        const cleanText = rawText.replace(/```json|```/g, "").trim();
        const feedback = JSON.parse(cleanText);

        question.feedback = feedback;
      } catch (aiError) {
        console.error("AI feedback generation failed for question:", question._id, aiError);
      }
    }

    const scoredQuestions = set.questions.filter((q) => q.feedback?.score !== undefined);
    if (scoredQuestions.length > 0) {
      const total = scoredQuestions.reduce((sum, q) => sum + q.feedback.score, 0);
      set.overallScore = Math.round((total / scoredQuestions.length) * 10) / 10;
    }

    set.status = "completed";
    await set.save();

    res.status(200).json(set);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  Get analytics summary for logged-in user
// route GET /api/interviews/analytics/summary
// access Private
const getAnalyticsSummary = async (req, res) => {
  try {
    const sets = await InterviewSet.find({
      user: req.user._id,
      status: "completed",
    }).sort({ createdAt: 1 });

    const totalInterviews = sets.length;

    const scoredSets = sets.filter((s) => s.overallScore !== undefined && s.overallScore !== null);
    const averageScore =
      scoredSets.length > 0
        ? Math.round(
            (scoredSets.reduce((sum, s) => sum + s.overallScore, 0) / scoredSets.length) * 10
          ) / 10
        : 0;

    const scoreTrend = scoredSets.map((s) => ({
      date: s.createdAt,
      score: s.overallScore,
      jobRole: s.jobRole,
    }));

    const roleBreakdown = {};
    sets.forEach((s) => {
      roleBreakdown[s.jobRole] = (roleBreakdown[s.jobRole] || 0) + 1;
    });

    res.status(200).json({
      totalInterviews,
      averageScore,
      scoreTrend,
      roleBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  generateQuestions,
  getMyInterviewSets,
  getInterviewSetById,
  submitAnswer,
  completeInterview,
  getAnalyticsSummary,
};