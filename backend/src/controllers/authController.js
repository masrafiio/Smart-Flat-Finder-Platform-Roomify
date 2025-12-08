import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// ---------------- REGISTER ----------------
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

    // Create user with all provided information
    const newUser = new User({
      name,
      email,
      password,
      role,
      phone,
      gender,
      occupation: occupation || "",
      dateOfBirth: dateOfBirth || null,
      bio: bio || "",
    });

    await newUser.save();

    const token = generateToken(newUser._id);

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
    console.error("Error in registerUser:", error);
    res.status(500).json({ message: "Error Creating User" });
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
