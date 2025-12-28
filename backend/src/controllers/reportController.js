import Report from "../models/Report.js";
import User from "../models/User.js";
import Property from "../models/Property.js";

// Get all reports (Admin only)
export const getAllReports = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const reports = await Report.find(filter)
      .populate("reporter", "name email role")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    // Populate reported items based on type
    for (let report of reports) {
      if (report.itemType === "user") {
        const reportedUser = await User.findById(report.reportedItem).select(
          "name email role"
        );
        report._doc.reportedItemDetails = reportedUser;
      } else if (report.itemType === "property") {
        const reportedProperty = await Property.findById(
          report.reportedItem
        ).select("title address.city");
        report._doc.reportedItemDetails = reportedProperty;
      }
    }

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

// Delete a report (Admin only)
export const deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findByIdAndDelete(reportId);
    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
