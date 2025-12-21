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

// ============ Property Reviews (Comments) ============

// Post a comment on a property
export const createPropertyReview = async (propertyId, comment) => {
  const response = await api.post(
    "/review/property",
    { propertyId, comment },
    setAuthToken()
  );
  return response.data;
};

// Get all comments for a property
export const getPropertyReviews = async (propertyId) => {
  const response = await api.get(`/review/property/${propertyId}`);
  return response.data;
};

// ============ User Ratings ============

// Rate a user (landlord ↔ tenant)
export const rateUser = async (ratingData) => {
  const response = await api.post("/review/user", ratingData, setAuthToken());
  return response.data;
};

// Get all ratings for a user
export const getUserRatings = async (userId) => {
  const response = await api.get(`/review/user/${userId}`);
  return response.data;
};

// Get my rating for a specific user
export const getMyRatingForUser = async (userId) => {
  const response = await api.get(
    `/review/user/${userId}/my-rating`,
    setAuthToken()
  );
  return response.data;
};
