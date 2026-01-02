import Booking from "../models/Booking.js";
import Property from "../models/Property.js";
import User from "../models/User.js";
//landlord ke mail pathai
import { sendBookingRequestEmail } from "../utils/mailer.js"; //mailer theke email template import
import Notification from "../models/Notification.js"; //notification model we are importing

// Create a booking request (visit or room booking)
export const createBookingRequest = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { propertyId, bookingType, proposedDate, moveInDate } = req.body;

    // Verify property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if property is available
    if (!property.isAvailable || property.availableRooms <= 0) {
      return res.status(400).json({ message: "Property is not available" });
    }

    // If booking type is "booking", check if tenant already has an active booking
    if (bookingType === "booking") {
      const existingBooking = await Booking.findOne({
        tenant: tenantId,
        bookingType: "booking",
        status: { $in: ["pending", "approved", "active"] },
      });

      if (existingBooking) {
        return res.status(400).json({
          message:
            "You already have an active booking. A tenant can only be in one property at a time.",
        });
      }
    }

    // Create booking
    const booking = await Booking.create({
      property: propertyId,
      tenant: tenantId,
      landlord: property.landlord,
      bookingType,
      proposedDate: bookingType === "visit" ? proposedDate : undefined,
      moveInDate: bookingType === "booking" ? moveInDate : undefined,
      status: "pending",
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate("property", "title address rent images")
      .populate("tenant", "name email phone")
      .populate("landlord", "name email phone");

    // Send email notification to landlord
    try {
      const landlord = await User.findById(property.landlord);
      const tenant = await User.findById(tenantId);
      const requestedDate = bookingType === "visit" ? proposedDate : moveInDate;
      
      console.log(`Sending booking request email to landlord ${landlord.email}...`);
      await sendBookingRequestEmail(
        landlord.email,
        tenant.name,
        tenant.email,
        property.title,
        bookingType,
        requestedDate
      );
      console.log(`Booking request email sent to ${landlord.email}`);

      // Create notification in database
      await Notification.create({
        user: landlord._id,
        property: property._id,
        type: "booking",
        message: `New ${bookingType === "visit" ? "visit" : "booking"} request from ${tenant.name} for "${property.title}"`,
      });
    } catch (emailError) {
      console.error(`Failed to send email to landlord:`, emailError.message); //still continue
    }

//////// done landlord///


    res.status(201).json({
      message: `${
        bookingType === "visit" ? "Visit" : "Booking"
      } request created successfully`,
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Failed to create booking request" });
  }
};

// Get my bookings (tenant)
export const getMyBookings = async (req, res) => {
  try {
    const tenantId = req.user.id;

    const bookings = await Booking.find({ tenant: tenantId })
      .populate("property", "title address rent images availableRooms")
      .populate("landlord", "name email phone")
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

// Get my current property (active booking)
export const getMyCurrentProperty = async (req, res) => {
  try {
    const tenantId = req.user.id;

    const activeBooking = await Booking.findOne({
      tenant: tenantId,
      bookingType: "booking",
      status: "active",
      propertyStatus: "active",
    })
      .populate("property")
      .populate("landlord", "name email phone");

    res.json({ booking: activeBooking });
  } catch (error) {
    console.error("Error fetching current property:", error);
    res.status(500).json({ message: "Failed to fetch current property" });
  }
};

// Get bookings for landlord's properties
export const getLandlordBookings = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const { status, bookingType } = req.query;

    const filter = { landlord: landlordId };
    if (status) filter.status = status;
    if (bookingType) filter.bookingType = bookingType;

    const bookings = await Booking.find(filter)
      .populate("property", "title address rent images")
      .populate("tenant", "name email phone gender occupation")
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    console.error("Error fetching landlord bookings:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

// Get bookings for a specific property
export const getPropertyBookings = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const landlordId = req.user.id;

    // Verify property belongs to landlord
    const property = await Property.findOne({
      _id: propertyId,
      landlord: landlordId,
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const bookings = await Booking.find({ property: propertyId })
      .populate("tenant", "name email phone gender occupation")
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    console.error("Error fetching property bookings:", error);
    res.status(500).json({ message: "Failed to fetch property bookings" });
  }
};

// Accept booking
export const acceptBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const landlordId = req.user.id;
    const { approvedVisitTime } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      landlord: landlordId,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ message: "Booking is not pending" });
    }

    const property = await Property.findById(booking.property);

    // For visit requests, require time selection
    if (booking.bookingType === "visit") {
      if (!approvedVisitTime) {
        return res.status(400).json({
          message: "Please select a visit time between 9am-5pm",
        });
      }
      booking.approvedVisitTime = approvedVisitTime;
      booking.status = "approved";
    } else {
      // For room booking
      if (property.availableRooms <= 0) {
        return res.status(400).json({ message: "No rooms available" });
      }

      // Add tenant to property
      const tenant = await User.findById(booking.tenant);

      // Add to tenants array (user references)
      if (!property.tenants.includes(booking.tenant)) {
        property.tenants.push(booking.tenant);
      }

      // Add to currentTenants array (display info)
      const tenantExists = property.currentTenants.some(
        (t) => t.name === tenant.name
      );

      if (!tenantExists) {
        property.currentTenants.push({
          name: tenant.name,
          gender: tenant.gender || "Not specified",
          occupation: tenant.occupation || "Not specified",
        });
      }

      // Decrease available rooms
      property.availableRooms -= 1;

      // Update property availability
      if (property.availableRooms === 0) {
        property.isAvailable = false;
      }

      await property.save();

      booking.status = "active";
      booking.propertyStatus = "active";
    }

    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate("property", "title address rent images")
      .populate("tenant", "name email phone")
      .populate("landlord", "name email phone");

    res.json({
      message: `${
        booking.bookingType === "visit" ? "Visit" : "Booking"
      } request accepted successfully`,
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("Error accepting booking:", error);
    res.status(500).json({ message: "Failed to accept booking" });
  }
};

// Reject booking
export const rejectBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const landlordId = req.user.id;

    const booking = await Booking.findOne({
      _id: bookingId,
      landlord: landlordId,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ message: "Booking is not pending" });
    }

    booking.status = "rejected";

    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate("property", "title address rent images")
      .populate("tenant", "name email phone")
      .populate("landlord", "name email phone");

    res.json({
      message: "Booking request rejected",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("Error rejecting booking:", error);
    res.status(500).json({ message: "Failed to reject booking" });
  }
};

// Cancel booking (tenant)
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const tenantId = req.user.id;

    const booking = await Booking.findOne({
      _id: bookingId,
      tenant: tenantId,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: "Only pending bookings can be cancelled",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate("property", "title address rent images")
      .populate("landlord", "name email phone");

    res.json({
      message: "Booking cancelled successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
};

// Leave property (tenant)
export const leaveProperty = async (req, res) => {
  try {
    const tenantId = req.user.id;

    const activeBooking = await Booking.findOne({
      tenant: tenantId,
      bookingType: "booking",
      status: "active",
      propertyStatus: "active",
    });

    if (!activeBooking) {
      return res.status(404).json({ message: "No active booking found" });
    }

    const property = await Property.findById(activeBooking.property);
    const tenant = await User.findById(tenantId);

    // Remove tenant from property
    property.tenants = property.tenants.filter(
      (t) => t.toString() !== tenantId
    );

    // Remove from currentTenants display array
    property.currentTenants = property.currentTenants.filter(
      (t) => t.name !== tenant.name
    );

    // Increase available rooms
    property.availableRooms += 1;

    // Update availability
    if (property.availableRooms > 0) {
      property.isAvailable = true;
    }

    await property.save();

    // Update booking status
    activeBooking.propertyStatus = "left";
    activeBooking.status = "completed";
    await activeBooking.save();

    res.json({
      message: "You have successfully left the property",
      booking: activeBooking,
    });
  } catch (error) {
    console.error("Error leaving property:", error);
    res.status(500).json({ message: "Failed to leave property" });
  }
};
