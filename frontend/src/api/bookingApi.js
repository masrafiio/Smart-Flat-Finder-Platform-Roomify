import api from "../lib/axios";

// Create booking request
export const createBookingRequest = async (bookingData) => {
  const response = await api.post("/booking/create", bookingData);
  return response.data;
};

// Get my bookings (tenant)
export const getMyBookings = async () => {
  const response = await api.get("/booking/my-bookings");
  return response.data;
};

// Get my current property (tenant)
export const getMyCurrentProperty = async () => {
  const response = await api.get("/booking/my-property");
  return response.data;
};

// Cancel booking (tenant)
export const cancelBooking = async (bookingId) => {
  const response = await api.put(`/booking/${bookingId}/cancel`);
  return response.data;
};

// Leave property (tenant)
export const leaveProperty = async () => {
  const response = await api.post("/booking/leave-property");
  return response.data;
};

// Get all landlord bookings
export const getLandlordBookings = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await api.get(`/booking/landlord/all?${params}`);
  return response.data;
};

// Get property bookings (landlord)
export const getPropertyBookings = async (propertyId) => {
  const response = await api.get(`/booking/property/${propertyId}`);
  return response.data;
};

// Accept booking (landlord)
export const acceptBooking = async (bookingId, data) => {
  const response = await api.put(`/booking/${bookingId}/accept`, data);
  return response.data;
};

// Reject booking (landlord)
export const rejectBooking = async (bookingId) => {
  const response = await api.put(`/booking/${bookingId}/reject`);
  return response.data;
};
