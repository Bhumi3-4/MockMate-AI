import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import socket from "../socket";

const QUESTION_TIME_LIMIT = 120;

const MockInterview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interviewSet, setInterviewSet] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSet = async () => {
      try {
        const res = await api.get(`/interviews/${id}`);
        setInterviewSet(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSet();

    socket.emit("join_interview", id);

    return () => {
      socket.emit("stop_timer");
    };
  }, [id]);

  // Listen for server-driven timer events
  useEffect(() => {
    const handleTick = (time) => setTimeLeft(time);
    const handleEnded = () => handleNext(true);

    socket.on("timer_tick", handleTick);
    socket.on("timer_ended", handleEnded);

    return () => {
      socket.off("timer_tick", handleTick);
      socket.off("timer_ended", handleEnded);
    };
  }, [currentIndex, interviewSet]);

  // Start a fresh timer whenever the question changes
  useEffect(() => {
    if (loading || !interviewSet) return;
    setTimeLeft(QUESTION_TIME_LIMIT);
    socket.emit("start_timer", { interviewId: id, duration: QUESTION_TIME_LIMIT });

    return () => {
      socket.emit("stop_timer");
    };
  }, [currentIndex, loading, interviewSet]);

  const currentQuestion = interviewSet?.questions[currentIndex];

  const handleAnswerChange = (e) => {
    setAnswer(e.target.value);
    socket.emit("answer_update", {
      interviewId: id,
      questionId: currentQuestion._id,
      answerText: e.target.value,
    });
  };

  const handleNext = async (autoAdvanced = false) => {
    if (submitting) return;
    setSubmitting(true);
    socket.emit("stop_timer");

    try {
      await api.put(`/interviews/${id}/answer`, {
        questionId: currentQuestion._id,
        answerText: answer,
      });

      if (currentIndex + 1 < interviewSet.questions.length) {
        setCurrentIndex((prev) => prev + 1);
        setAnswer("");
      } else {
        await api.put(`/interviews/${id}/complete`);
        navigate(`/results/${id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading interview...</div>;
  if (!interviewSet) return <div className="text-center mt-10">Interview not found</div>;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-500">
          Question {currentIndex + 1} of {interviewSet.questions.length}
        </span>
        <span
          className={`font-mono text-lg ${timeLeft <= 10 ? "text-red-600" : "text-gray-700"}`}
        >
          {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
      </div>

      <div className="bg-white p-6 rounded shadow mb-4">
        <span className="text-xs uppercase text-blue-600 font-semibold">
          {currentQuestion.category}
        </span>
        <h2 className="text-xl font-semibold mt-2">{currentQuestion.questionText}</h2>
      </div>

      <textarea
        value={answer}
        onChange={handleAnswerChange}
        placeholder="Type your answer here..."
        rows={8}
        className="w-full border p-3 rounded mb-4"
      />

      <button
        onClick={() => handleNext(false)}
        disabled={submitting}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting
          ? "Saving..."
          : currentIndex + 1 < interviewSet.questions.length
          ? "Next Question"
          : "Finish Interview"}
      </button>
    </div>
  );
};

export default MockInterview;