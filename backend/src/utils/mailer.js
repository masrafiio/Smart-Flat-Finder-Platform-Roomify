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
