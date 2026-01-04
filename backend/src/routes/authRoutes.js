import express from "express";
import { registerUser, verifyOTP, resendOTP, loginUser, logoutUser } from "../controllers/authController.js";

const router = express.Router();

// REGISTER (Send OTP)
router.post("/register", registerUser);

// VERIFY OTP
router.post("/verify-otp", verifyOTP);

// RESEND OTP
router.post("/resend-otp", resendOTP);

// LOGIN
router.post("/login", loginUser);

// LOGOUT
router.post("/logout", logoutUser);


export default router;
