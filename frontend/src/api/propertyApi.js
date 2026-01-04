import api from "../lib/axios";

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
  const response = await api.get(`/property/${id}`);
  return response.data;
};

// Create new property (landlord only)
export const createProperty = async (propertyData) => {
  const response = await api.post("/property", propertyData);
  return response.data;
};

// Update property (landlord only)
export const updateProperty = async (id, propertyData) => {
  const response = await api.put(`/property/${id}`, propertyData);
  return response.data;
};

// Delete property (landlord only)
export const deleteProperty = async (id) => {
  const response = await api.delete(`/property/${id}`);
  return response.data;
};
