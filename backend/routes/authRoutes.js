import express from "express";
import {
  registerUser,
  loginUser,
  getMe,       // ✔ correct function
  getAllUsers
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", getMe);   // ✔ fixed

// ⭐ NEW ROUTE (Manager Filters Need This)
router.get("/users", getAllUsers);

export default router;
