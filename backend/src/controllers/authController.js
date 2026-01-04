import User from "../models/User.js";
import OTP from "../models/OTP.js";
import jwt from "jsonwebtoken";
import { sendOTPEmail } from "../utils/mailer.js";

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

//  REGISTER (SEND OTP) 
export async function registerUser(req, res) {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      gender,
      occupation,
      dateOfBirth,
      bio,
    } = req.body;

    // Basic validation
    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Name, email, password, and role are required" });
    }

    // Role-specific validation
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    if (!gender) {
      return res.status(400).json({ message: "Gender is required" });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase() });

    // Save OTP to database (expires in 10 minutes)
    await OTP.create({
      email: email.toLowerCase(),
      otp,
      purpose: "email_verification",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // Send OTP email
    await sendOTPEmail(email, otp);
    console.log(`OTP sent to ${email}: ${otp}`);

    // Store registration data temporarily in session/response for OTP verification
    res.status(200).json({
      message: "OTP sent to your email. Please verify to complete registration.",
      email: email.toLowerCase(),
      requiresOTP: true,
    });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ message: "Error sending OTP" });
  }
}

// VERIFY OTP 
export async function verifyOTP(req, res) {
  try {
    const { email, otp, userData } = req.body;

    // Validation
    if (!email || !otp || !userData) {
      return res.status(400).json({ message: "Email, OTP, and user data are required" });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      otp,
      purpose: "email_verification",
      isUsed: false,
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // OTP is expired or not
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "OTP has expired" });
    }

    // user already exists or not
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create user with given data
    const newUser = new User({
      name: userData.name,
      email: email.toLowerCase(),
      password: userData.password,
      role: userData.role,
      phone: userData.phone,
      gender: userData.gender,
      occupation: userData.occupation || "",
      dateOfBirth: userData.dateOfBirth || null,
      bio: userData.bio || "",
    });

    await newUser.save();

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Generate token
    const token = generateToken(newUser._id);

    console.log(`User registered successfully: ${newUser.email}`);

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        gender: newUser.gender,
        occupation: newUser.occupation,
        dateOfBirth: newUser.dateOfBirth,
        bio: newUser.bio,
      },
    });
  } catch (error) {
    console.error("Error in verifyOTP:", error);
    res.status(500).json({ message: "Error verifying OTP" });
  }
}

// RESEND OTP FUNCTION 
export async function resendOTP(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Generate new 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete old OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase() });

    // Save new OTP
    await OTP.create({
      email: email.toLowerCase(),
      otp,
      purpose: "email_verification",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // Send OTP email
    await sendOTPEmail(email, otp);
    console.log(`OTP resent to ${email}: ${otp}`);

    res.status(200).json({
      message: "New OTP sent to your email",
    });
  } catch (error) {
    console.error("Error in resendOTP:", error);
    res.status(500).json({ message: "Error resending OTP" });
  }
}

// ---------------- LOGIN ----------------
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if user is suspended
    if (user.isSuspended) {
      if (user.suspendedUntil && user.suspendedUntil > new Date()) {
        return res.status(403).json({
          message: `Account suspended until ${user.suspendedUntil.toLocaleDateString()}`,
        });
      } else if (user.suspendedUntil && user.suspendedUntil <= new Date()) {
        // Auto-unsuspend if suspension period has passed
        user.isSuspended = false;
        user.suspendedUntil = null;
        await user.save();
      } else {
        return res.status(403).json({ message: "Account is suspended" });
      }
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        gender: user.gender,
        occupation: user.occupation,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ message: "Error Logging In" });
  }
}

// ---------------- LOGOUT ----------------
export async function logoutUser(req, res) {
  try {
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logoutUser:", error);
    res.status(500).json({ message: "Error Logging Out" });
  }
}
