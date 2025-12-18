import Report from "../models/Report.js";
import User from "../models/User.js";
import Property from "../models/Property.js";

// Get all reports (Admin only)
export const getAllReports = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const reports = await Report.find(filter)
      .populate("reporter", "name email")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update report status
export const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, adminNotes, actionTaken } = req.body;

    const report = await Report.findByIdAndUpdate(
      reportId,
      {
        status,
        adminNotes,
        actionTaken,
        reviewedBy: req.user.id,
      },
      { new: true }
    );

    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    }

    res.status(200).json({ success: true, message: "Report updated", report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a report
export const createReport = async (req, res) => {
  try {
    const { reportedItem, itemType, reason, description } = req.body;

    const report = await Report.create({
      reporter: req.user.id,
      reportedItem,
      itemType,
      reason,
      description,
    });

    res
      .status(201)
      .json({ success: true, message: "Report submitted", report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
