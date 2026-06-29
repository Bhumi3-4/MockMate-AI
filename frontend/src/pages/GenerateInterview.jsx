import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const GenerateInterview = () => {
  const [jobRole, setJobRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("fresher");
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/interviews/generate", {
        jobRole,
        experienceLevel,
        numQuestions,
      });
      navigate(`/interview/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate questions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Generate Mock Interview</h1>

      {error && (
        <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
        <input
          type="text"
          placeholder="Job Role (e.g. Backend Developer)"
          value={jobRole}
          onChange={(e) => setJobRole(e.target.value)}
          required
          className="w-full border p-2 rounded mb-3"
        />
        <select
          value={experienceLevel}
          onChange={(e) => setExperienceLevel(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        >
          <option value="fresher">Fresher</option>
          <option value="junior">Junior</option>
          <option value="mid">Mid-level</option>
          <option value="senior">Senior</option>
        </select>
        <input
          type="number"
          min={3}
          max={10}
          value={numQuestions}
          onChange={(e) => setNumQuestions(Number(e.target.value))}
          className="w-full border p-2 rounded mb-4"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Generating questions..." : "Generate Interview"}
        </button>
      </form>
    </div>
  );
};

export default GenerateInterview;