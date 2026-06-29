// client/src/pages/Analytics.jsx
import { useState, useEffect } from "react";
import api from "../api/axios";

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/interviews/analytics/summary");
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading analytics...</div>;
  if (!data) return <div className="text-center mt-10">No data available</div>;

  return (
    <div className="min-h-screen p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-6 rounded shadow text-center">
          <p className="text-3xl font-bold text-blue-600">{data.totalInterviews}</p>
          <p className="text-sm text-gray-500">Completed Interviews</p>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <p className="text-3xl font-bold text-green-600">{data.averageScore}/10</p>
          <p className="text-sm text-gray-500">Average Score</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="font-semibold mb-4">Score Trend</h2>
        {data.scoreTrend.length === 0 ? (
          <p className="text-gray-500 text-sm">No completed interviews yet</p>
        ) : (
          <div className="space-y-2">
            {data.scoreTrend.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm border-b pb-2">
                <span>
                  {item.jobRole} — {new Date(item.date).toLocaleDateString()}
                </span>
                <span className="font-semibold">{item.score}/10</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="font-semibold mb-4">Interviews by Role</h2>
        <div className="space-y-2">
          {Object.entries(data.roleBreakdown).map(([role, count]) => (
            <div key={role} className="flex justify-between text-sm">
              <span>{role}</span>
              <span className="font-semibold">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;