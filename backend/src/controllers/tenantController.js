import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Property from "../models/Property.js";

// ---------------- GET TENANT PROFILE ----------------
export async function getTenantProfile(req, res) {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "tenant") {
      return res.status(403).json({ message: "Access denied. Tenants only." });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profilePicture: user.profilePicture,
        gender: user.gender,
        occupation: user.occupation,
        dateOfBirth: user.dateOfBirth,
        bio: user.bio,
        averageRating: user.averageRating,
        totalRatings: user.totalRatings,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in getTenantProfile:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
}

// ---------------- UPDATE TENANT PROFILE ----------------
export async function updateTenantProfile(req, res) {
  try {
    const userId = req.user.id;
    const {
      name,
      phone,
      gender,
      occupation,
      dateOfBirth,
      bio,
      profilePicture,
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "tenant") {
      return res.status(403).json({ message: "Access denied. Tenants only." });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;
    if (occupation !== undefined) user.occupation = occupation;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (bio !== undefined) user.bio = bio;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profilePicture: user.profilePicture,
        gender: user.gender,
        occupation: user.occupation,
        dateOfBirth: user.dateOfBirth,
        bio: user.bio,
        averageRating: user.averageRating,
        totalRatings: user.totalRatings,
      },
    });
  } catch (error) {
    console.error("Error in updateTenantProfile:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
}

// ---------------- GET TENANT BOOKINGS ----------------
export async function getTenantBookings(req, res) {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user || user.role !== "tenant") {
      return res.status(403).json({ message: "Access denied. Tenants only." });
    }

    const bookings = await Booking.find({ tenant: userId })
      .populate("property", "title address rent images")
      .populate("landlord", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error in getTenantBookings:", error);
    res.status(500).json({ message: "Error fetching bookings" });
  }
}

// ---------------- GET TENANT WISHLIST ----------------
export async function getTenantWishlist(req, res) {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate({
      path: "wishlist",
      populate: {
        path: "owner",
        select: "name email phone averageRating",
      },
    });

    if (!user || user.role !== "tenant") {
      return res.status(403).json({ message: "Access denied. Tenants only." });
    }

    res.status(200).json({ wishlist: user.wishlist });
  } catch (error) {
    console.error("Error in getTenantWishlist:", error);
    res.status(500).json({ message: "Error fetching wishlist" });
  }
}

// ---------------- ADD TO WISHLIST ----------------
export async function addToWishlist(req, res) {
  try {
    const userId = req.user.id;
    const { propertyId } = req.body;

    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== "tenant") {
      return res.status(403).json({ message: "Access denied. Tenants only." });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if already in wishlist
    if (user.wishlist.includes(propertyId)) {
      return res.status(400).json({ message: "Property already in wishlist" });
    }

    user.wishlist.push(propertyId);
    await user.save();

    res.status(200).json({ message: "Added to wishlist successfully" });
  } catch (error) {
    console.error("Error in addToWishlist:", error);
    res.status(500).json({ message: "Error adding to wishlist" });
  }
}

// ---------------- REMOVE FROM WISHLIST ----------------
export async function removeFromWishlist(req, res) {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;

    const user = await User.findById(userId);
    if (!user || user.role !== "tenant") {
      return res.status(403).json({ message: "Access denied. Tenants only." });
    }

    user.wishlist = user.wishlist.filter((id) => id.toString() !== propertyId);
    await user.save();

    res.status(200).json({ message: "Removed from wishlist successfully" });
  } catch (error) {
    console.error("Error in removeFromWishlist:", error);
    res.status(500).json({ message: "Error removing from wishlist" });
  }
}

// ---------------- GET VIEWED PROPERTIES ----------------
export async function getViewedProperties(req, res) {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate({
      path: "viewedProperties",
      populate: {
        path: "owner",
        select: "name email phone averageRating",
      },
    });

    if (!user || user.role !== "tenant") {
      return res.status(403).json({ message: "Access denied. Tenants only." });
    }

    res.status(200).json({ viewedProperties: user.viewedProperties });
  } catch (error) {
    console.error("Error in getViewedProperties:", error);
    res.status(500).json({ message: "Error fetching viewed properties" });
  }
}

// ---------------- GET USER PROFILE BY ID ----------------
export async function getUserProfile(req, res) {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profilePicture: user.profilePicture,
      gender: user.gender,
      occupation: user.occupation,
      bio: user.bio,
      averageRating: user.averageRating,
      totalRatings: user.totalRatings,
      verificationStatus: user.verificationStatus,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    res.status(500).json({ message: "Error fetching user profile" });
  }
}
