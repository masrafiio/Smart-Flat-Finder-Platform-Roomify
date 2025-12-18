import Property from "../models/Property.js";

// Get all properties (Admin only)
export const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find()
      .populate("landlord", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, properties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get pending property verifications (Admin only)
export const getPendingVerifications = async (req, res) => {
  try {
    const properties = await Property.find({ verificationStatus: "pending" })
      .populate("landlord", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, properties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve property (Admin only)
export const approveProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const property = await Property.findByIdAndUpdate(
      propertyId,
      { verificationStatus: "approved", isPublished: true },
      { new: true }
    );

    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Property approved", property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject property (Admin only)
export const rejectProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { rejectionReason } = req.body;

    const property = await Property.findByIdAndUpdate(
      propertyId,
      { verificationStatus: "rejected", isPublished: false, rejectionReason },
      { new: true }
    );

    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Property rejected", property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete property (Admin only)
export const deleteProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const property = await Property.findByIdAndDelete(propertyId);
    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Property deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
