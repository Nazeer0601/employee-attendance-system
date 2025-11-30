import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="header">
      <div>
        <h3>Attendance System</h3>
        <div className="small">Welcome {user?.name || "Guest"}</div>
      </div>

      <div className="nav">
        {!user && <Link to="/login">Login</Link>}

        {/* EMPLOYEE MENU */}
        {user?.role === "employee" && (
          <>
            <Link to="/employee/dashboard">Dashboard</Link>
            <Link to="/employee/my-attendance">My Attendance</Link>
            <Link to="/employee/calendar">Calendar</Link>
            <Link to="/profile">Profile</Link>   {/* ⭐ NEW */}
          </>
        )}

        {/* MANAGER MENU */}
        {user?.role === "manager" && (
          <>
            <Link to="/manager/dashboard">Manager Dashboard</Link>
            <Link to="/manager/attendance">Attendance</Link>
            <Link to="/profile">Profile</Link>   {/* ⭐ NEW */}
          </>
        )}

        {/* LOGOUT BUTTON */}
        {user && (
          <button onClick={handleLogout}>Logout</button>
        )}
      </div>
    </div>
  );
}
