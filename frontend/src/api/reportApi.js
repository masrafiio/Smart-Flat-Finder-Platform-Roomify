import api from "../lib/axios";

// Create a report
export const createReport = async (reportData) => {
  const response = await api.post("/report", reportData);
  return response.data;
};

// Get all reports (admin only)
export const getAllReports = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  
  const response = await api.get(`/admin/reports?${params.toString()}`);
  return response.data;
};

// Update report status (admin only)
export const updateReportStatus = async (reportId, updateData) => {
  const response = await api.put(`/admin/reports/${reportId}`, updateData);
  return response.data;
};
