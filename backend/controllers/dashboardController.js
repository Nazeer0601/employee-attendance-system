import Attendance from "../models/Attendance.js";
import User from "../models/User.js";
import moment from "moment";

/**
 * Employee Dashboard Stats
 * - today's status
 * - this month's summary
 * - last 7 days recent records
 * - total hours this month
 */
export const employeeStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const today = moment().format("YYYY-MM-DD");
    const monthStart = moment().startOf("month").format("YYYY-MM-DD");
    const monthEnd = moment().endOf("month").format("YYYY-MM-DD");

    // today's attendance
    const todayDoc = await Attendance.findOne({ userId, date: today });

    // this month's docs
    const monthDocs = await Attendance.find({
      userId,
      date: { $gte: monthStart, $lte: monthEnd }
    });

    let present = 0, absent = 0, late = 0, halfDay = 0, totalHours = 0;
    monthDocs.forEach((d) => {
      if (d.status === "present") present++;
      if (d.status === "late") late++;
      if (d.status === "half-day") halfDay++;
      if (d.status === "absent") absent++;
      totalHours += d.totalHours || 0;
    });

    // last 7 days
    const sevenDaysAgo = moment().subtract(7, "days").format("YYYY-MM-DD");
    const recent = await Attendance.find({
      userId,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: -1 });

    return res.json({
      todayStatus: todayDoc?.status || "not-checked-in",
      monthSummary: {
        present,
        late,
        halfDay,
        absent,
        totalHours: Math.round(totalHours * 100) / 100
      },
      recent
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Manager Dashboard Stats
 */
export const managerStats = async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ error: "Manager access only" });
    }

    const totalEmployees = await User.countDocuments({ role: "employee" });

    const today = moment().format("YYYY-MM-DD");
    const todaysRecords = await Attendance.find({ date: today });

    const presentToday = todaysRecords.length;
    const lateToday = todaysRecords.filter((d) => d.status === "late").length;

    // absent employees = employees who don't have today's attendance record
    const allEmployees = await User.find({ role: "employee" }).select("name employeeId department");
    const presentIds = todaysRecords.map((t) => String(t.userId));

    const absentEmployees = allEmployees.filter(
      (e) => !presentIds.includes(String(e._id))
    );

    // chart: weekly attendance trend
    const weekTrend = [];
    for (let i = 6; i >= 0; i--) {
      const day = moment().subtract(i, "days").format("YYYY-MM-DD");
      const count = await Attendance.countDocuments({ date: day });
      weekTrend.push({ date: day, present: count });
    }

    // department-wise
    const deptMap = {};
    todaysRecords.forEach((rec) => {
      const user = allEmployees.find((u) => String(u._id) === String(rec.userId));
      const dept = user?.department || "Unknown";
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    });

    return res.json({
      totalEmployees,
      presentToday,
      lateToday,
      absentEmployees,
      weekTrend,
      deptWise: deptMap
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
};
