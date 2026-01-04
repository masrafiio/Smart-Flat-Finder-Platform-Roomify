import api from "../lib/axios";

// Get tenant profile
export const getTenantProfile = async () => {
  const response = await api.get("/tenant/profile");
  return response.data;
};

// Update tenant profile
export const updateTenantProfile = async (profileData) => {
  const response = await api.put("/tenant/profile", profileData);
  return response.data;
};

// Get tenant bookings
export const getTenantBookings = async () => {
  const response = await api.get("/tenant/bookings");
  return response.data;
};

// Get tenant wishlist
export const getTenantWishlist = async () => {
  const response = await api.get("/tenant/wishlist");
  return response.data;
};

// Add to wishlist
export const addToWishlist = async (propertyId) => {
  const response = await api.post("/tenant/wishlist", { propertyId });
  return response.data;
};

// Remove from wishlist
export const removeFromWishlist = async (propertyId) => {
  const response = await api.delete(`/tenant/wishlist/${propertyId}`);
  return response.data;
};

// Get viewed properties
export const getViewedProperties = async () => {
  const response = await api.get("/tenant/viewed-properties");
  return response.data;
};
