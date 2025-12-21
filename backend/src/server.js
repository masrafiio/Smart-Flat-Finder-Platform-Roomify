import express from "express";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import tenantRoutes from "./routes/tenantRoutes.js";
import landlordRoutes from "./routes/landlordRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
// import bookingRoutes from "./routes/bookingRoutes.js";
// import forumRoutes from "./routes/forumRoutes.js";
// import notificationRoutes from "./routes/notificationRoutes.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/authentication", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tenant", tenantRoutes);
app.use("/api/landlord", landlordRoutes);
app.use("/api/property", propertyRoutes);
app.use("/api/review", reviewRoutes);
// app.use("/api/booking", bookingRoutes);
// app.use("/api/forum", forumRoutes);
// app.use("/api/notification", notificationRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on port:", PORT);
  });
});
