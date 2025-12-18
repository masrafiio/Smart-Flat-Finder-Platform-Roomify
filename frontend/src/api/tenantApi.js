import api from "../lib/axios";

// Set auth token in headers
const setAuthToken = () => {
  const token = localStorage.getItem("token");
  if (token) {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }
  return {};
};

// Get tenant profile
export const getTenantProfile = async () => {
  const response = await api.get("/tenant/profile", setAuthToken());
  return response.data;
};

// Update tenant profile
export const updateTenantProfile = async (profileData) => {
  const response = await api.put("/tenant/profile", profileData, setAuthToken());
  return response.data;
};

// Get tenant bookings
export const getTenantBookings = async () => {
  const response = await api.get("/tenant/bookings", setAuthToken());
  return response.data;
};

// Get tenant wishlist
export const getTenantWishlist = async () => {
  const response = await api.get("/tenant/wishlist", setAuthToken());
  return response.data;
};

// Add to wishlist
export const addToWishlist = async (propertyId) => {
  const response = await api.post("/tenant/wishlist", { propertyId }, setAuthToken());
  return response.data;
};

// Remove from wishlist
export const removeFromWishlist = async (propertyId) => {
  const response = await api.delete(`/tenant/wishlist/${propertyId}`, setAuthToken());
  return response.data;
};

// Get viewed properties
export const getViewedProperties = async () => {
  const response = await api.get("/tenant/viewed-properties", setAuthToken());
  return response.data;
};
