import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, setUser } = useAuth();

  const [jobRole, setJobRole] = useState(user?.jobRole || "");
  const [experienceLevel, setExperienceLevel] = useState(
    user?.experienceLevel || "fresher"
  );
  const [resumeFile, setResumeFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.put("/users/profile", {
        jobRole,
        experienceLevel,
      });

      if (res.data.user) {
        setUser(res.data.user);
      }

      setMessage("Profile updated successfully");
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();

    if (!resumeFile) {
      setMessage("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);

    setLoading(true);

    try {
      const res = await api.post("/users/resume", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.user) {
        setUser(res.data.user);
      }

      setMessage("Resume uploaded successfully");
      setResumeFile(null);
    } catch (err) {
      setMessage(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      {message && (
        <p className="bg-blue-100 text-blue-700 p-2 rounded mb-4 text-sm">
          {message}
        </p>
      )}

      {/* Profile Update Form */}
      <form
        onSubmit={handleProfileUpdate}
        className="mb-8 bg-white p-6 rounded shadow"
      >
        <h2 className="font-semibold mb-3">Job Details</h2>

        <input
          type="text"
          placeholder="Target Job Role (e.g. Frontend Developer)"
          value={jobRole}
          onChange={(e) => setJobRole(e.target.value)}
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

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </form>

      {/* Resume Upload Form */}
      <form
        onSubmit={handleResumeUpload}
        className="bg-white p-6 rounded shadow"
      >
        <h2 className="font-semibold mb-3">Resume</h2>

        {user?.resumeUrl && (
          <a
            href={user.resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline text-sm block mb-3"
          >
            View Current Resume
          </a>
        )}

        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setResumeFile(e.target.files[0])}
          className="block mb-3"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload Resume"}
        </button>
      </form>
    </div>
  );
};

export default Profile;