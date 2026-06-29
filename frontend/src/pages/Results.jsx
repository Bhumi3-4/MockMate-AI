import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

const Results = () => {
  const { id } = useParams();
  const [interviewSet, setInterviewSet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get(`/interviews/${id}`);
        setInterviewSet(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [id]);

  if (loading) return <div className="text-center mt-10">Loading results...</div>;
  if (!interviewSet) return <div className="text-center mt-10">Results not found</div>;

  return (
    <div className="min-h-screen p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Interview Results</h1>
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-600">
            {interviewSet.overallScore ?? "N/A"}/10
          </p>
          <p className="text-sm text-gray-500">Overall Score</p>
        </div>
      </div>

      <p className="text-gray-600 mb-6">
        {interviewSet.jobRole} — {interviewSet.experienceLevel}
      </p>

      <div className="space-y-6">
        {interviewSet.questions.map((q, idx) => (
          <div key={q._id} className="bg-white p-6 rounded shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">
                Q{idx + 1}: {q.questionText}
              </h3>
              {q.feedback?.score !== undefined && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-semibold whitespace-nowrap ml-4">
                  {q.feedback.score}/10
                </span>
              )}
            </div>

            <p className="text-gray-700 mb-4 italic">"{q.answerText || "No answer given"}"</p>

            {q.feedback && (
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-green-700 mb-1">Strengths</p>
                  <ul className="list-disc list-inside text-gray-600">
                    {q.feedback.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-red-700 mb-1">Weaknesses</p>
                  <ul className="list-disc list-inside text-gray-600">
                    {q.feedback.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-yellow-700 mb-1">Suggestions</p>
                  <ul className="list-disc list-inside text-gray-600">
                    {q.feedback.suggestions?.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Link to="/dashboard" className="inline-block mt-6 text-blue-600 underline">
        Back to Dashboard
      </Link>
    </div>
  );
};

export default Results;