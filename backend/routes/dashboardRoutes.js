import express from "express";
import auth from "../middleware/authMiddleware.js";
import {
  employeeStats,
  managerStats
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/employee", auth, employeeStats);
router.get("/manager", auth, managerStats);

export default router;
