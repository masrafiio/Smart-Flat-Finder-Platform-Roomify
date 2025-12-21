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

// Get all properties with filters
export const getAllProperties = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });

  const response = await api.get(`/property?${params.toString()}`);
  return response.data;
};

// Get single property by ID
export const getPropertyById = async (id) => {
  const response = await api.get(`/property/${id}`, setAuthToken());
  return response.data;
};

// Create new property (landlord only)
export const createProperty = async (propertyData) => {
  const response = await api.post("/property", propertyData, setAuthToken());
  return response.data;
};

// Update property (landlord only)
export const updateProperty = async (id, propertyData) => {
  const response = await api.put(
    `/property/${id}`,
    propertyData,
    setAuthToken()
  );
  return response.data;
};

// Delete property (landlord only)
export const deleteProperty = async (id) => {
  const response = await api.delete(`/property/${id}`, setAuthToken());
  return response.data;
};
