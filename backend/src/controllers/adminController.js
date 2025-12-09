import User from "../models/User.js";
import Property from "../models/Property.js";
import Report from "../models/Report.js";

// Get admin dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLandlords = await User.countDocuments({ role: "landlord" });
    const totalTenants = await User.countDocuments({ role: "tenant" });
    const totalProperties = await Property.countDocuments();
    const pendingVerifications = await Property.countDocuments({
      verificationStatus: "pending",
    });
    const pendingReports = await Report.countDocuments({ status: "pending" });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalLandlords,
        totalTenants,
        totalProperties,
        pendingVerifications,
        pendingReports,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single user details
export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Suspend user
export const suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { suspendedUntil } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isSuspended: true, suspendedUntil },
      { new: true }
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User suspended", user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Unsuspend user
export const unsuspendUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isSuspended: false, suspendedUntil: null },
      { new: true }
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User unsuspended", user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update admin profile
export const updateAdminProfile = async (req, res) => {
  try {
    const { name, phone, profilePicture, bio } = req.body;
    const userId = req.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, phone, profilePicture, bio },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
