import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();

  const actions = [
    {
      to: "/generate",
      label: "New Mock Interview",
      desc: "Generate fresh questions for a role and start practicing.",
      accent: "bg-indigo-600",
    },
    {
      to: "/history",
      label: "History",
      desc: "Review past interview sessions and your answers.",
      accent: "bg-emerald-600",
    },
    {
      to: "/analytics",
      label: "Analytics",
      desc: "Track your average score and progress over time.",
      accent: "bg-amber-600",
    },
    {
      to: "/profile",
      label: "Edit Profile",
      desc: "Update your target role, experience level, and resume.",
      accent: "bg-slate-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Welcome back, {user?.name?.split(" ")[0]}
            </h1>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="text-sm font-medium text-gray-600 hover:text-red-600 border border-gray-300 px-4 py-2 rounded-md hover:border-red-300 transition-colors"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid sm:grid-cols-2 gap-5">
          {actions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="block bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className={`w-2 h-2 rounded-full ${action.accent} mb-4`} />
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                {action.label}
              </h2>
              <p className="text-sm text-gray-500">{action.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;