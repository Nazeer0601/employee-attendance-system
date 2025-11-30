import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import ManagerAttendance from "./pages/ManagerAttendance";
import MyAttendance from "./pages/MyAttendance";
import useAuthStore from "./store/authStore";
import AttendanceCalendar from "./pages/AttendanceCalendar";
import Profile from "./pages/Profile";



export default function App() {
  const user = useAuthStore((s) => s.user);

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? (user.role === "manager" ? "/manager/dashboard" : "/employee/dashboard") : "/login"} />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/employee/dashboard" element={user?.role === "employee" ? <EmployeeDashboard /> : <Navigate to="/login" />} />
      <Route path="/employee/my-attendance" element={user?.role === "employee" ? <MyAttendance /> : <Navigate to="/login" />} />
      <Route
  path="/profile"
  element={user ? <Profile /> : <Navigate to="/login" />}
/>
      <Route
  path="/profile"
  element={user ? <Profile /> : <Navigate to="/login" />}
/>

      <Route path="/manager/dashboard" element={user?.role === "manager" ? <ManagerDashboard /> : <Navigate to="/login" />} />
      <Route
  path="/employee/calendar"
  element={
    user?.role === "employee" ? (
      <AttendanceCalendar />
    ) : (
      <Navigate to="/login" />
    )
  }
/>

      <Route
  path="/manager/attendance"
  element={
    user?.role === "manager" ? (
      <ManagerAttendance />
    ) : (
      <Navigate to="/login" />
    )
  }
/>
      <Route path="*" element={<div style={{ padding: 30 }}>Page not found</div>} />
    </Routes>
  );
}
