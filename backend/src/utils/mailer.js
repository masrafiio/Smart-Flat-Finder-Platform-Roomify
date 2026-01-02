import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const emailUser = process.env.EMAIL_USER?.trim();
const emailPass = process.env.EMAIL_PASS?.trim();

console.log('Email Config:', {
  user: emailUser,
  passLength: emailPass?.length,
  passStart: emailPass?.substring(0, 4),
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

//FOR PRICE UPDATING NOTIFICATION

export const sendPriceChangeEmail = async (userEmail, propertyTitle, oldPrice, newPrice) => {
  const mailOptions = {
    from: process.env.EMAIL_USER?.trim(),
    to: userEmail,
    subject: `Price Update: ${propertyTitle}`,
    html: `
      <h2>Price Change Notification</h2>
      <p>The price for <strong>${propertyTitle}</strong> in your wishlist has been updated.</p>
      <p><strong>Previous Price:</strong> $${oldPrice}</p>
      <p><strong>New Price:</strong> $${newPrice}</p>
      <p><strong>LESSSGOOO.. BRO BUY IT ALREADY...</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

//FOR AVAILABILITY STATUS CHANGE NOTIFICATION
export const sendAvailabilityChangeEmail = async (userEmail, propertyTitle, isAvailable) => {
  const status = isAvailable ? "Available" : "Not Available";
  const statusColor = isAvailable ? "#10b981" : "#ef4444";
  
  const mailOptions = {
    from: process.env.EMAIL_USER?.trim(),
    to: userEmail,
    subject: `Availability Update: ${propertyTitle}`,
    html: `
      <h2>Availability Change Notification</h2>
      <p>The availability status for <strong>${propertyTitle}</strong> in your wishlist has changed.</p>
      <p><strong>New Status:</strong> <span style="color: ${statusColor};">${status}</span></p>
      ${isAvailable ? 
        '<p>YOOOO! This property is now available. BOOK IT FAST FAST!</p>' : 
        '<p>BOOOO! This property is currently not available. You are late bro.</p>'
      }
    `,
  };

  await transporter.sendMail(mailOptions);
};


// Landloard //

//FOR BOOKING REQUEST NOTIFICATION TO LANDLORD
export const sendBookingRequestEmail = async (landlordEmail, tenantName, tenantEmail, propertyTitle, bookingType, requestedDate) => {
  const requestType = bookingType === "visit" ? "Property Visit" : "Room Booking";
  const dateLabel = bookingType === "visit" ? "Proposed Visit Date" : "Move-In Date";
  
  const mailOptions = {
    from: process.env.EMAIL_USER?.trim(),
    to: landlordEmail,
    subject: `New ${requestType} Request: ${propertyTitle}`,
    html: `
      <h2>New ${requestType} Request</h2>
      <p>You have received a new ${requestType.toLowerCase()} request for your property <strong>${propertyTitle}</strong>.</p>
      
      <h3>Tenant Details:</h3>
      <ul>
        <li><strong>Name:</strong> ${tenantName}</li>
        <li><strong>Email:</strong> ${tenantEmail}</li>
      </ul>
      
      <h3>Request Details:</h3>
      <ul>
        <li><strong>Request Type:</strong> ${requestType}</li>
        <li><strong>${dateLabel}:</strong> ${new Date(requestedDate).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</li>
      </ul>
      
      <p>Please log in to your dashboard to review and respond to this request.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
