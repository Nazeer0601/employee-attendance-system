// backend/controllers/attendanceController.js
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";
import moment from "moment";

/**
 * Helper: get today's date string (YYYY-MM-DD)
 */
const todayStr = () => moment().format("YYYY-MM-DD");

/**
 * Helper: parse time string/return moment
 */
const parseTime = (timeStr) =>
  timeStr ? moment(timeStr, moment.ISO_8601) : null;

/**
 * Check-in endpoint
 * - creates or updates today's attendance document with checkInTime
 * - marks status: "present" or "late" (we treat 09:15 as late threshold)
 */
export const checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = moment();
    const date = now.format("YYYY-MM-DD");
    const checkInTime = now.toISOString();

    // find existing attendance for today
    let attendance = await Attendance.findOne({ userId, date });

    if (attendance && attendance.checkInTime) {
      return res.status(400).json({ error: "Already checked in today" });
    }

    // determine status (late threshold 09:15)
    const lateThreshold = moment(date + " 09:15", "YYYY-MM-DD HH:mm");
    const status = now.isAfter(lateThreshold) ? "late" : "present";

    if (!attendance) {
      attendance = await Attendance.create({
        userId,
        date,
        checkInTime,
        status,
        checkOutTime: null,
        totalHours: 0,
      });
    } else {
      attendance.checkInTime = checkInTime;
      attendance.status = status;
      await attendance.save();
    }

    return res.json({ message: "Checked in", attendance });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Check-out endpoint
 * - sets checkOutTime, calculates totalHours
 * - updates status to half-day if total < 4, otherwise keep existing status
 */
export const checkOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = moment();
    const date = now.format("YYYY-MM-DD");
    const checkOutTime = now.toISOString();

    const attendance = await Attendance.findOne({ userId, date });
    if (!attendance || !attendance.checkInTime) {
      return res.status(400).json({ error: "You haven't checked in today" });
    }
    if (attendance.checkOutTime) {
      return res.status(400).json({ error: "Already checked out today" });
    }

    // calculate total hours between checkInTime and now
    const checkIn = moment(attendance.checkInTime);
    let totalHours = moment.duration(now.diff(checkIn)).asHours();
    // round to 2 decimals
    totalHours = Math.round(totalHours * 100) / 100;

    attendance.checkOutTime = checkOutTime;
    attendance.totalHours = totalHours;

    // if total hours less than 4 -> half-day
    if (totalHours > 0 && totalHours < 4) {
      attendance.status = "half-day";
    } else if (totalHours === 0) {
      attendance.status = attendance.status || "present";
    }

    await attendance.save();

    return res.json({ message: "Checked out", attendance });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * My history (employee) - paginated optional
 * Query params: page, limit, month (YYYY-MM)
 */
export const myHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 50, month } = req.query;

    const query = { userId };

    if (month) {
      // month as YYYY-MM -> match date starting with this
      query.date = { $regex: `^${month}` };
    }

    const data = await Attendance.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Attendance.countDocuments(query);

    return res.json({ data, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * My monthly summary
 * Query params: month (1-12) and year, or monthStr YYYY-MM
 * returns: present, absent, late, half-day counts and total hours
 */
export const mySummary = async (req, res) => {
  try {
    const userId = req.user.id;
    let { month, year, monthStr } = req.query;

    let start, end;
    if (monthStr) {
      start = moment(monthStr + "-01", "YYYY-MM-DD").startOf("month");
    } else {
      const m = month ? Number(month) - 1 : moment().month();
      const y = year ? Number(year) : moment().year();
      start = moment().year(y).month(m).startOf("month");
    }
    end = start.clone().endOf("month");

    // fetch all attendance docs for that month
    const docs = await Attendance.find({
      userId,
      date: { $gte: start.format("YYYY-MM-DD"), $lte: end.format("YYYY-MM-DD") },
    });

    let present = 0,
      absent = 0,
      late = 0,
      halfDay = 0,
      totalHours = 0;

    // We assume "absent" means missing record on working day.
    // For simple implementation, we'll count days with records only.
    // (In frontend you can combine with company calendar to mark weekends/holidays.)
    docs.forEach((d) => {
      if (d.status === "present") present++;
      else if (d.status === "late") late++;
      else if (d.status === "half-day") halfDay++;
      else if (d.status === "absent") absent++;
      // fallback
      else if (d.checkInTime && !d.checkOutTime) present++;
      totalHours += d.totalHours || 0;
    });

    totalHours = Math.round(totalHours * 100) / 100;

    return res.json({
      month: start.format("YYYY-MM"),
      present,
      late,
      halfDay,
      absent,
      totalHours,
      totalDaysRecorded: docs.length,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Today's status for employee
 */
export const todayStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const date = todayStr();

    let attendance = await Attendance.findOne({ userId, date });

    if (!attendance) {
      return res.json({ date, status: "not-checked-in", attendance: null });
    }

    return res.json({ date, status: attendance.status || "present", attendance });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Manager: get all attendance
 * Query params: employeeId, date (YYYY-MM-DD), status (present/absent/late/half-day),
 * page, limit
 * NOTE: must be manager to use (auth middleware should set req.user.role)
 */
export const allAttendance = async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ error: "Manager access required" });
    }

    const { employeeId, date, status, page = 1, limit = 100 } = req.query;
    const query = {};

    if (employeeId) {
      // map employeeId to userId
      const user = await User.findOne({ employeeId });
      if (user) query.userId = user._id;
      else return res.json({ data: [], total: 0 });
    }

    if (date) query.date = date;
    if (status) query.status = status;

    const total = await Attendance.countDocuments(query);
    const data = await Attendance.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // populate user info
    const populated = await Promise.all(
      data.map(async (d) => {
        const user = await User.findById(d.userId).select("name email employeeId department");
        return { attendance: d, user };
      })
    );

    return res.json({ data: populated, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Manager: get specific employee's attendance by user id (or employeeId param)
 * route param :id may be user id or employeeId
 */
export const employeeAttendance = async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ error: "Manager access required" });
    }

    const { id } = req.params; // id can be user._id or employeeId
    let user = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(id);
    } else {
      user = await User.findOne({ employeeId: id });
    }

    if (!user) return res.status(404).json({ error: "User not found" });

    const docs = await Attendance.find({ userId: user._id }).sort({ date: -1 });

    return res.json({ user: { name: user.name, employeeId: user.employeeId }, attendance: docs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Manager: team summary
 * - total employees
 * - today's present / absent counts
 * - late arrivals today
 * - dept-wise counts (requires department set on user)
 */
export const teamSummary = async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ error: "Manager access required" });
    }

    const employees = await User.find({ role: "employee" }).select("name employeeId department");

    const totalEmployees = employees.length;
    const date = todayStr();

    const todays = await Attendance.find({ date });

    const presentCount = todays.filter((t) => t.status === "present" || t.status === "late" || t.status === "half-day").length;
    const lateCount = todays.filter((t) => t.status === "late").length;

    // who is absent today = employees without attendance doc
    const presentUserIds = todays.map((t) => String(t.userId));
    const absentList = employees
      .filter((e) => !presentUserIds.includes(String(e._id)))
      .map((e) => ({ name: e.name, employeeId: e.employeeId, department: e.department }));

    // department-wise
    const deptMap = {};
    todays.forEach((t) => {
      // find user for dept
      // to keep efficient, build a map of id->dept
    });
    // build id->user map
    const idToUser = {};
    employees.forEach((e) => (idToUser[String(e._id)] = e));

    const deptCounts = {};
    todays.forEach((t) => {
      const u = idToUser[String(t.userId)];
      const dept = (u && u.department) || "Unknown";
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });

    return res.json({
      totalEmployees,
      presentToday: presentCount,
      lateToday: lateCount,
      absentToday: absentList,
      deptCounts,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Manager: export CSV
 * Query params: start (YYYY-MM-DD), end (YYYY-MM-DD), employeeId (optional)
 *
 * Responds with CSV attachment
 */
export const exportCSV = async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ error: "Manager access required" });
    }

    let { start, end, employeeId } = req.query;

    // default: last 30 days
    const endDate = end ? moment(end, "YYYY-MM-DD") : moment();
    const startDate = start ? moment(start, "YYYY-MM-DD") : endDate.clone().subtract(30, "days");

    const dateQuery = {
      $gte: startDate.format("YYYY-MM-DD"),
      $lte: endDate.format("YYYY-MM-DD"),
    };

    const query = { date: dateQuery };

    if (employeeId) {
      const user = await User.findOne({ employeeId });
      if (!user) return res.status(404).json({ error: "Employee not found" });
      query.userId = user._id;
    }

    const docs = await Attendance.find(query).sort({ date: 1 });

    // Build CSV content
    const header = [
      "EmployeeId",
      "Name",
      "Email",
      "Department",
      "Date",
      "CheckInTime",
      "CheckOutTime",
      "Status",
      "TotalHours",
    ];
    const rows = [header.join(",")];

    // load user cache
    const userIds = [...new Set(docs.map((d) => String(d.userId)))];
    const users = await User.find({ _id: { $in: userIds } }).select("name email employeeId department");
    const userMap = {};
    users.forEach((u) => (userMap[String(u._id)] = u));

    docs.forEach((d) => {
      const u = userMap[String(d.userId)] || {};
      const row = [
        `"${(u.employeeId || "")}"`,
        `"${(u.name || "")}"`,
        `"${(u.email || "")}"`,
        `"${(u.department || "")}"`,
        `"${d.date || ""}"`,
        `"${d.checkInTime || ""}"`,
        `"${d.checkOutTime || ""}"`,
        `"${d.status || ""}"`,
        `"${d.totalHours || 0}"`,
      ];
      rows.push(row.join(","));
    });

    const csv = rows.join("\n");

    // set headers for download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="attendance_${startDate.format("YYYYMMDD")}_${endDate.format("YYYYMMDD")}.csv"`);

    return res.send(csv);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
