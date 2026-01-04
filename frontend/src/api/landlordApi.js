import api from "../lib/axios";

// Get landlord profile
export const getLandlordProfile = async () => {
  const response = await api.get("/landlord/profile");
  return response.data;
};

// Update landlord profile
export const updateLandlordProfile = async (profileData) => {
  const response = await api.put("/landlord/profile", profileData);
  return response.data;
};

// Get landlord's properties
export const getLandlordProperties = async () => {
  const response = await api.get("/landlord/properties");
  return response.data;
};

// Get landlord dashboard stats
export const getLandlordStats = async () => {
  const response = await api.get("/landlord/stats");
  return response.data;
};

// Create property
export const createProperty = async (propertyData) => {
  const response = await api.post("/property", propertyData);
  return response.data;
};

// Update property
export const updateProperty = async (propertyId, propertyData) => {
  const response = await api.put(`/property/${propertyId}`, propertyData);
  return response.data;
};

// Delete property
export const deleteProperty = async (propertyId) => {
  const response = await api.delete(`/property/${propertyId}`);
  return response.data;
};

// Add current tenant to property
export const addCurrentTenant = async (propertyId, tenantData) => {
  const response = await api.post(`/property/${propertyId}/tenants`, tenantData);
  return response.data;
};

// Remove current tenant from property
export const removeCurrentTenant = async (propertyId, tenantId) => {
  const response = await api.delete(`/property/${propertyId}/tenants/${tenantId}`);
  return response.data;
};

// Get property view history
export const getPropertyViewHistory = async () => {
  const response = await api.get("/landlord/view-history");
  return response.data;
};
