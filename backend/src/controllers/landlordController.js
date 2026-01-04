import User from "../models/User.js";
import Property from "../models/Property.js";

// Get landlord profile
export const getLandlordProfile = async (req, res) => {
  try {
    const landlord = await User.findById(req.user._id).select("-password");

    if (!landlord) {
      return res.status(404).json({ message: "Landlord not found" });
    }

    res.status(200).json(landlord);
  } catch (error) {
    console.error("Error fetching landlord profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update landlord profile
export const updateLandlordProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      gender,
      occupation,
      dateOfBirth,
      bio,
      profilePicture,
    } = req.body;

    const landlord = await User.findById(req.user._id);

    if (!landlord) {
      return res.status(404).json({ message: "Landlord not found" });
    }

    // Update fields if provided
    if (name) landlord.name = name;
    if (phone) landlord.phone = phone;
    if (gender) landlord.gender = gender;
    if (occupation) landlord.occupation = occupation;
    if (dateOfBirth) landlord.dateOfBirth = dateOfBirth;
    if (bio) landlord.bio = bio;
    if (profilePicture) landlord.profilePicture = profilePicture;

    await landlord.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: landlord._id,
        name: landlord.name,
        email: landlord.email,
        role: landlord.role,
        phone: landlord.phone,
        gender: landlord.gender,
        occupation: landlord.occupation,
        dateOfBirth: landlord.dateOfBirth,
        bio: landlord.bio,
        profilePicture: landlord.profilePicture,
      },
    });
  } catch (error) {
    console.error("Error updating landlord profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get landlord's properties
export const getLandlordProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      landlord: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      count: properties.length,
      properties,
    });
  } catch (error) {
    console.error("Error fetching landlord properties:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get landlord dashboard stats
export const getLandlordStats = async (req, res) => {
  try {
    const totalProperties = await Property.countDocuments({
      landlord: req.user._id,
    });

    const publishedProperties = await Property.countDocuments({
      landlord: req.user._id,
      isPublished: true,
    });

    const pendingProperties = await Property.countDocuments({
      landlord: req.user._id,
      verificationStatus: "pending",
    });

    const totalViews = await Property.aggregate([
      { $match: { landlord: req.user._id } },
      { $group: { _id: null, totalViews: { $sum: "$viewCount" } } },
    ]);

    res.status(200).json({
      totalProperties,
      publishedProperties,
      pendingProperties,
      totalViews: totalViews[0]?.totalViews || 0,
    });
  } catch (error) {
    console.error("Error fetching landlord stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get landlord's properties by user ID (for viewing other landlord's properties)
export const getLandlordPropertiesById = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify the user is a landlord
    const landlord = await User.findById(userId);
    if (!landlord || landlord.role !== "landlord") {
      return res.status(404).json({ message: "Landlord not found" });
    }

    const properties = await Property.find({
      landlord: userId,
      isPublished: true,
    }).sort({ createdAt: -1 });

    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching landlord properties:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get view history for landlord's properties
export const getPropertyViewHistory = async (req, res) => {
  try {
    const landlordId = req.user._id;

    const properties = await Property.find({ landlord: landlordId })
      .populate({
        path: "viewedBy.user",
        select: "name email phone profilePicture",
      })
      .select("title viewedBy viewCount")
      .sort({ "viewedBy.viewedAt": -1 });

    res.status(200).json({ properties });
  } catch (error) {
    console.error("Error fetching view history:", error);
    res.status(500).json({ message: "Server error" });
  }
};
