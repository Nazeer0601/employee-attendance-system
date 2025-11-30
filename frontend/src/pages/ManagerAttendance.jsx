import React from "react";
import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";

export default function ManagerAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [filterDate, setFilterDate] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // ⭐ CSV DOWNLOAD FUNCTION
  const downloadCSV = async () => {
    try {
      const response = await API.get("/attendance/export", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "attendance_report.csv");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("Error downloading CSV", err);
      alert("Failed to download CSV");
    }
  };

  // Load employee list for filter dropdown
  const fetchEmployees = async () => {
    try {
      const res = await API.get("/auth/users");
      setEmployees(res.data || []);
    } catch (err) {
      console.log("Failed to load employees");
    }
  };

  // Load attendance records
  const fetchAttendance = async () => {
    try {
      const res = await API.get(
        `/attendance/all?page=${page}&limit=10&date=${filterDate}&employeeId=${filterEmployee}&status=${filterStatus}`
      );

      setAttendance(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);

    } catch (err) {
      console.error(err);
      alert("Error loading attendance");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [page]);

  const applyFilters = () => {
    setPage(1);
    fetchAttendance();
  };

  const clearFilters = () => {
    setFilterDate("");
    setFilterEmployee("");
    setFilterStatus("");
    setPage(1);
    fetchAttendance();
  };

  return (
    <div className="app-container">
      <Navbar />

      <div className="bg-white p-6 shadow rounded-lg mt-6">

        {/* Header with CSV Button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">All Employees Attendance</h2>

          <button
            onClick={downloadCSV}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">

          {/* Date Filter */}
          <div>
            <label className="text-sm">Date</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>

          {/* Employee Filter */}
          <div>
            <label className="text-sm">Employee</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp.employeeId}>
                  {emp.name} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-sm">Status</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
              <option value="half-day">Half-day</option>
            </select>
          </div>

          {/* Apply + Clear Buttons */}
          <div className="flex items-end gap-2">
            <button
              onClick={applyFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Apply
            </button>

            <button
              onClick={clearFilters}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Clear
            </button>
          </div>

        </div>

        {/* Attendance Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Employee ID</th>
                <th className="px-4 py-2	border">Name</th>
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Check In</th>
                <th className="px-4 py-2 border">Check Out</th>
                <th className="px-4 py-2 border">Total Hours</th>
              </tr>
            </thead>

            <tbody>
              {attendance.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    No records found
                  </td>
                </tr>
              )}

              {attendance.map((item) => (
                <tr key={item._id} className="border-b">
                  <td className="px-4 py-2">{item.employeeId}</td>
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">{item.date}</td>
                  <td className="px-4 py-2">
                    <span
                      className={
                        item.status === "present"
                          ? "text-green-600"
                          : item.status === "late"
                          ? "text-yellow-600"
                          : item.status === "absent"
                          ? "text-red-600"
                          : "text-gray-700"
                      }
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="px-4 py-2">
                    {item.checkInTime
                      ? new Date(item.checkInTime).toLocaleTimeString()
                      : "--"}
                  </td>

                  <td className="px-4 py-2">
                    {item.checkOutTime
                      ? new Date(item.checkOutTime).toLocaleTimeString()
                      : "--"}
                  </td>

                  <td className="px-4 py-2">{item.totalHours || "--"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            disabled={page === 1}
            className={`px-4 py-2 rounded ${
              page === 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>

          <p className="text-gray-700">
            Page {page} of {totalPages}
          </p>

          <button
            disabled={page === totalPages}
            className={`px-4 py-2 rounded ${
              page === totalPages
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>

      </div>
    </div>
  );
}
