import Property from "../models/Property.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js"; // for notification_create --> db fetching
import {
  sendPriceChangeEmail,
  sendAvailabilityChangeEmail,
} from "../utils/mailer.js"; // to sent the email

// Create a new property (landlord only)
export const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      propertyType,
      address,
      googleMapsLink,
      googleMapsEmbedLink,
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
      googleMapsEmbedLink: googleMapsEmbedLink || "",
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
      googleMapsEmbedLink,
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

    // Track old values for change notifications
    const oldRent = property.rent;
    const oldAvailableRooms = property.availableRooms;

    // Update fields
    if (title) property.title = title;
    if (description) property.description = description;
    if (propertyType) property.propertyType = propertyType;
    if (address) property.address = { ...property.address, ...address };
    if (googleMapsLink !== undefined) property.googleMapsLink = googleMapsLink;
    if (googleMapsEmbedLink !== undefined)
      property.googleMapsEmbedLink = googleMapsEmbedLink;
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

    console.log(
      `Before save - Old rent: ${oldRent}, New rent from request: ${rent}`
    );
    console.log(
      `Before save - Old availableRooms: ${oldAvailableRooms}, New availableRooms from request: ${availableRooms}`
    );
    await property.save();

    console.log(`After save - Property rent in DB: ${property.rent}`);
    console.log(
      `After save - Property availableRooms in DB: ${property.availableRooms}`
    );

    // Get users with this property in wishlist for notifications
    const usersWithWishlist = await User.find({ wishlist: property._id });

    // Send price change notifications if rent changed
    if (rent !== undefined && oldRent !== rent) {
      console.log(`Price changed from ৳${oldRent} to ৳${rent}`);
      const usersWithWishlist = await User.find({ wishlist: property._id });
      console.log(
        `Found ${usersWithWishlist.length} users with property in wishlist`
      );

      for (const user of usersWithWishlist) {
        try {
          console.log(`Sending price change email to ${user.email}...`);
          await sendPriceChangeEmail(user.email, property.title, oldRent, rent);
          console.log(`Price change email sent to ${user.email}`);

          // db update kri bhai
          await Notification.create({
            user: user._id,
            property: property._id,
            type: "price_change",
            message: `Price for "${property.title}" changed from ৳${oldRent} to ৳${rent}`,
          });
        } catch (emailError) {
          console.error(`Failed to notify ${user.email}:`, emailError.message);
        }
      }
    }

    // Send availability change notifications if availableRooms transitions to/from 0
    if (availableRooms !== undefined) {
      const wasAvailable = oldAvailableRooms > 0;
      const isNowAvailable = availableRooms > 0;

      //chng hoilei email pathai (0 <-> >0)
      if (wasAvailable !== isNowAvailable) {
        console.log(
          `Available rooms changed from ${oldAvailableRooms} to ${availableRooms} - Status: ${
            wasAvailable ? "Available" : "Unavailable"
          } → ${isNowAvailable ? "Available" : "Unavailable"}`
        );
        console.log(
          `Found ${usersWithWishlist.length} users with property in wishlist`
        );

        for (const user of usersWithWishlist) {
          try {
            console.log(
              `Sending availability change email to ${user.email}...`
            );
            await sendAvailabilityChangeEmail(
              user.email,
              property.title,
              isNowAvailable
            );
            console.log(`Availability change email sent to ${user.email}`);

            await Notification.create({
              user: user._id,
              property: property._id,
              type: "availability_change",
              message: `"${property.title}" is now ${
                isNowAvailable ? "available" : "not available"
              }`,
            });
          } catch (emailError) {
            console.error(
              `Failed to notify ${user.email}:`,
              emailError.message
            );
          }
        }
      }
    }

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

// Get all properties for admin (Admin only) - includes suspended properties
export const getAllPropertiesAdmin = async (req, res) => {
  try {
    const properties = await Property.find()
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

// Suspend property (Admin only)
export const suspendProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const property = await Property.findByIdAndUpdate(
      propertyId,
      { isPublished: false, isAvailable: false, isSuspended: true },
      { new: true }
    );

    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Property suspended", property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Unsuspend property (Admin only)
export const unsuspendProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const property = await Property.findByIdAndUpdate(
      propertyId,
      { isPublished: true, isAvailable: true, isSuspended: false },
      { new: true }
    );

    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Property unsuspended", property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete property (Admin only) - no ownership check
export const deletePropertyAdmin = async (req, res) => {
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
    console.error("Error deleting property:", error);
    res.status(500).json({ success: false, message: error.message });
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
