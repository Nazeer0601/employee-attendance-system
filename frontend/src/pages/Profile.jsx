import React from "react";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../api";
import useAuthStore from "../store/authStore";

export default function Profile() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await API.get("/dashboard/employee"); // works for both employee & manager
      setStats(res.data.monthSummary);
    } catch (err) {
      console.log("Error loading profile data");
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const attendancePercent = stats
    ? ((stats.present / (stats.present + stats.absent + stats.late + stats.halfDay)) * 100).toFixed(1)
    : 0;

  return (
    <div className="app-container">
      <Navbar />

      <div className="bg-white p-6 shadow rounded-lg mt-6 max-w-xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Profile</h2>

        {/* BASIC INFO */}
        <div className="mb-4">
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Employee ID:</strong> {user?.employeeId}</p>
          <p><strong>Department:</strong> {user?.department}</p>
          <p><strong>Role:</strong> {user?.role}</p>
        </div>

        {/* MONTH SUMMARY */}
        {stats && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Monthly Summary</h3>

            <p className="small">Present: {stats.present}</p>
            <p className="small">Late: {stats.late}</p>
            <p className="small">Half-day: {stats.halfDay}</p>
            <p className="small">Total Hours: {stats.totalHours}</p>

            <p className="mt-3 font-medium">
              <strong>Attendance %:</strong> {attendancePercent}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
