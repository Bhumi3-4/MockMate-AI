// client/src/pages/History.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const History = () => {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/interviews");
        setSets(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading history...</div>;

  return (
    <div className="min-h-screen p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Interview History</h1>

      {sets.length === 0 && (
        <p className="text-gray-500">No interviews yet. Generate your first one!</p>
      )}

      <div className="space-y-4">
        {sets.map((set) => (
          <div
            key={set._id}
            className="bg-white p-4 rounded shadow flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{set.jobRole}</p>
              <p className="text-sm text-gray-500">
                {set.experienceLevel} • {new Date(set.createdAt).toLocaleDateString()}
              </p>
              <span
                className={`inline-block mt-1 text-xs px-2 py-1 rounded ${
                  set.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {set.status}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {set.overallScore !== undefined && set.overallScore !== null && (
                <span className="font-bold text-blue-600">{set.overallScore}/10</span>
              )}
              <Link
                to={set.status === "completed" ? `/results/${set._id}` : `/interview/${set._id}`}
                className="text-blue-600 underline text-sm"
              >
                {set.status === "completed" ? "View Results" : "Continue"}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;