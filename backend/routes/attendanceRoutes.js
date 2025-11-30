import express from "express";
import auth from "../middleware/authMiddleware.js";
import {
  checkIn,
  checkOut,
  myHistory,
  mySummary,
  todayStatus,
  allAttendance,
  employeeAttendance,
  teamSummary,
  exportCSV
} from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/checkin", auth, checkIn);
router.post("/checkout", auth, checkOut);
router.get("/my-history", auth, myHistory);
router.get("/my-summary", auth, mySummary);
router.get("/today", auth, todayStatus);

// Manager
router.get("/all", auth, allAttendance);
router.get("/employee/:id", auth, employeeAttendance);
router.get("/summary", auth, teamSummary);
router.get("/export", auth, exportCSV);

export default router;
