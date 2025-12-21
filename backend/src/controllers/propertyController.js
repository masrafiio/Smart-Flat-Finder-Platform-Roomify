import Property from "../models/Property.js";
import User from "../models/User.js";

// Create a new property (landlord only)
export const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      propertyType,
      address,
      googleMapsLink,
      rent,
      securityDeposit,
      totalRooms,
      availableRooms,
      amenities,
      images,
      currentTenants,
      availableFrom,
    } = req.body;

    // Validation
    if (!title || !description || !propertyType || !rent || !totalRooms) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!address || !address.city) {
      return res.status(400).json({ message: "City is required" });
    }

    // Create property
    const property = await Property.create({
      landlord: req.user._id,
      title,
      description,
      propertyType,
      address,
      googleMapsLink: googleMapsLink || "",
      rent,
      securityDeposit: securityDeposit || 0,
      totalRooms,
      availableRooms:
        availableRooms !== undefined ? availableRooms : totalRooms,
      amenities: amenities || [],
      images: images || [],
      currentTenants: currentTenants || [],
      availableFrom: availableFrom || new Date(),
      isAvailable: availableRooms > 0,
    });

    res.status(201).json({
      message: "Property created successfully",
      property,
    });
  } catch (error) {
    console.error("Error creating property:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update property (landlord only)
export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if user is the landlord of this property
    if (property.landlord.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this property" });
    }

    const {
      title,
      description,
      propertyType,
      address,
      googleMapsLink,
      rent,
      securityDeposit,
      totalRooms,
      availableRooms,
      amenities,
      images,
      currentTenants,
      availableFrom,
      isAvailable,
    } = req.body;

    // Update fields
    if (title) property.title = title;
    if (description) property.description = description;
    if (propertyType) property.propertyType = propertyType;
    if (address) property.address = { ...property.address, ...address };
    if (googleMapsLink !== undefined) property.googleMapsLink = googleMapsLink;
    if (rent !== undefined) property.rent = rent;
    if (securityDeposit !== undefined)
      property.securityDeposit = securityDeposit;
    if (totalRooms !== undefined) property.totalRooms = totalRooms;
    if (availableRooms !== undefined) property.availableRooms = availableRooms;
    if (amenities) property.amenities = amenities;
    if (images) property.images = images;
    if (currentTenants) property.currentTenants = currentTenants;
    if (availableFrom) property.availableFrom = availableFrom;
    if (isAvailable !== undefined) property.isAvailable = isAvailable;

    await property.save();

    res.status(200).json({
      message: "Property updated successfully",
      property,
    });
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete property (landlord only)
export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if user is the landlord of this property
    if (property.landlord.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this property" });
    }

    await Property.findByIdAndDelete(id);

    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single property details
export const getProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id)
      .populate(
        "landlord",
        "name email phone profilePicture averageRating totalRatings"
      )
      .populate(
        "tenants",
        "name email phone gender occupation averageRating totalRatings"
      );

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Increment view count (only if not the landlord viewing)
    if (
      !req.user ||
      property.landlord._id.toString() !== req.user._id.toString()
    ) {
      property.viewCount += 1;
      await property.save();
    }

    res.status(200).json(property);
  } catch (error) {
    console.error("Error fetching property:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all properties (with filters)
export const getAllProperties = async (req, res) => {
  try {
    const {
      city,
      propertyType,
      minRent,
      maxRent,
      minRooms,
      amenities,
      isAvailable,
      search,
    } = req.query;

    let query = { isPublished: true, verificationStatus: "approved" };

    if (city) query["address.city"] = { $regex: city, $options: "i" };
    if (propertyType) query.propertyType = propertyType;
    if (minRent || maxRent) {
      query.rent = {};
      if (minRent) query.rent.$gte = Number(minRent);
      if (maxRent) query.rent.$lte = Number(maxRent);
    }
    if (minRooms) query.availableRooms = { $gte: Number(minRooms) };
    if (amenities) {
      const amenitiesArray = amenities.split(",");
      query.amenities = { $all: amenitiesArray };
    }
    if (isAvailable !== undefined) query.isAvailable = isAvailable === "true";
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "address.city": { $regex: search, $options: "i" } },
      ];
    }

    const properties = await Property.find(query)
      .populate("landlord", "name email phone averageRating")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: properties.length,
      properties,
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add current tenant to property
export const addCurrentTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, gender, occupation } = req.body;

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if user is the landlord
    if (property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Add tenant
    property.currentTenants.push({ name, gender, occupation });

    // Update available rooms
    const occupiedRooms = property.currentTenants.length;
    property.availableRooms = property.totalRooms - occupiedRooms;
    property.isAvailable = property.availableRooms > 0;

    await property.save();

    res.status(200).json({
      message: "Tenant added successfully",
      property,
    });
  } catch (error) {
    console.error("Error adding tenant:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove current tenant from property
export const removeCurrentTenant = async (req, res) => {
  try {
    const { id, tenantId } = req.params;

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if user is the landlord
    if (property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Remove tenant
    property.currentTenants = property.currentTenants.filter(
      (tenant) => tenant._id.toString() !== tenantId
    );

    // Update available rooms
    const occupiedRooms = property.currentTenants.length;
    property.availableRooms = property.totalRooms - occupiedRooms;
    property.isAvailable = property.availableRooms > 0;

    await property.save();

    res.status(200).json({
      message: "Tenant removed successfully",
      property,
    });
  } catch (error) {
    console.error("Error removing tenant:", error);
    res.status(500).json({ message: "Server error" });
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
