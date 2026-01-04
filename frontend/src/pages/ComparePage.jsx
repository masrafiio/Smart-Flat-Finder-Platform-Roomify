import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const ComparePage = () => {
  const navigate = useNavigate();
  const [searchTerm1, setSearchTerm1] = useState("");
  const [searchTerm2, setSearchTerm2] = useState("");
  const [searchResults1, setSearchResults1] = useState([]);
  const [searchResults2, setSearchResults2] = useState([]);
  const [selectedProperty1, setSelectedProperty1] = useState(null);
  const [selectedProperty2, setSelectedProperty2] = useState(null);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);

  // Search for properties
  const searchProperties = async (term, setResults, setLoading) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(
        `/property?search=${encodeURIComponent(term)}`
      );
      setResults(response.data.properties || []);
    } catch (error) {
      console.error("Error searching properties:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProperties(searchTerm1, setSearchResults1, setLoading1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm1]);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchProperties(searchTerm2, setSearchResults2, setLoading2);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm2]);

  const selectProperty1 = (property) => {
    setSelectedProperty1(property);
    setSearchTerm1(property.title);
    setSearchResults1([]);
  };

  const selectProperty2 = (property) => {
    setSelectedProperty2(property);
    setSearchTerm2(property.title);
    setSearchResults2([]);
  };

  const clearProperty1 = () => {
    setSelectedProperty1(null);
    setSearchTerm1("");
    setSearchResults1([]);
  };

  const clearProperty2 = () => {
    setSelectedProperty2(null);
    setSearchTerm2("");
    setSearchResults2([]);
  };

  const PropertyCard = ({ property, side }) => (
    <div className="card bg-base-100 shadow-xl h-full">
      <figure className="h-48">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/400x300?text=No+Image";
            }}
          />
        ) : (
          <div className="w-full h-full bg-base-300 flex items-center justify-center">
            <span className="text-base-content opacity-50">No Image</span>
          </div>
        )}
      </figure>
      <div className="card-body p-4">
        <h2 className="card-title text-lg">{property.title}</h2>

        <div className="space-y-3 text-sm">
          {/* Price */}
          <div className="bg-primary/10 p-3 rounded-lg">
            <p className="font-semibold text-primary text-2xl">
              ৳{property.rent}/month
            </p>
            {property.securityDeposit > 0 && (
              <p className="text-xs opacity-70 mt-1">
                + ৳{property.securityDeposit} deposit
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <p className="font-semibold mb-1">📍 Location</p>
            <p className="opacity-70">
              {property.address.street && `${property.address.street}, `}
              {property.address.city}, {property.address.state}{" "}
              {property.address.zipCode}
            </p>
          </div>

          {/* Property Type & Rooms */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-base-200 p-2 rounded">
              <p className="font-semibold">Type</p>
              <p className="capitalize opacity-70">{property.propertyType}</p>
            </div>
            <div className="bg-base-200 p-2 rounded">
              <p className="font-semibold">Rooms</p>
              <p className="opacity-70">
                {property.availableRooms}/{property.totalRooms} available
              </p>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <p className="font-semibold mb-2">✨ Amenities</p>
            {property.amenities && property.amenities.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {property.amenities.slice(0, 5).map((amenity, index) => (
                  <span key={index} className="badge badge-sm badge-outline">
                    {amenity}
                  </span>
                ))}
                {property.amenities.length > 5 && (
                  <span className="badge badge-sm">
                    +{property.amenities.length - 5} more
                  </span>
                )}
              </div>
            ) : (
              <p className="opacity-50 text-xs">No amenities listed</p>
            )}
          </div>

          {/* Reviews */}
          <div className="bg-base-200 p-2 rounded">
            <p className="font-semibold mb-1">⭐ Rating</p>
            {property.averageRating > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-yellow-500">
                  {property.averageRating.toFixed(1)}
                </span>
                <span className="opacity-70 text-xs">
                  ({property.totalReviews} reviews)
                </span>
              </div>
            ) : (
              <p className="opacity-50 text-xs">No reviews yet</p>
            )}
          </div>

          {/* Status */}
          <div className="flex gap-2">
            <span
              className={`badge ${
                property.isAvailable ? "badge-success" : "badge-error"
              }`}
            >
              {property.isAvailable ? "Available" : "Not Available"}
            </span>
            {property.verificationStatus === "approved" && (
              <span className="badge badge-info">✓ Verified</span>
            )}
          </div>

          {/* Landlord */}
          {property.landlord && (
            <div className="border-t pt-2 mt-2">
              <p className="font-semibold text-xs mb-1">Landlord</p>
              <div className="flex items-center gap-2">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-8">
                    <span className="text-xs">
                      {property.landlord.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {property.landlord.name}
                  </p>
                  {property.landlord.averageRating > 0 && (
                    <p className="text-xs opacity-70">
                      ⭐ {property.landlord.averageRating.toFixed(1)} rating
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => navigate(`/property/${property._id}`)}
              className="btn btn-primary btn-sm flex-1"
            >
              View Details
            </button>
            <button
              onClick={side === 1 ? clearProperty1 : clearProperty2}
              className="btn btn-ghost btn-sm"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <Navbar />

      <div className="flex-grow container mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Compare Properties</h1>
          <p className="text-lg opacity-70">
            Select two properties to compare side by side
          </p>
        </div>

        {/* Search Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Property 1 Search */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-primary">Property 1</h3>
              <div className="form-control relative">
                <input
                  type="text"
                  placeholder="Search for a property..."
                  className="input input-bordered w-full"
                  value={searchTerm1}
                  onChange={(e) => setSearchTerm1(e.target.value)}
                  disabled={!!selectedProperty1}
                />
                {loading1 && (
                  <span className="loading loading-spinner loading-sm absolute right-3 top-3"></span>
                )}

                {/* Search Results Dropdown */}
                {searchResults1.length > 0 && !selectedProperty1 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-base-100 shadow-xl rounded-lg max-h-64 overflow-y-auto z-10 border border-base-300">
                    {searchResults1.map((property) => (
                      <div
                        key={property._id}
                        className="p-3 hover:bg-base-200 cursor-pointer border-b border-base-300 last:border-b-0"
                        onClick={() => selectProperty1(property)}
                      >
                        <p className="font-semibold">{property.title}</p>
                        <p className="text-sm opacity-70">
                          {property.address.city} - ৳{property.rent}/month
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedProperty1 && (
                <div className="mt-4">
                  <PropertyCard property={selectedProperty1} side={1} />
                </div>
              )}
            </div>
          </div>

          {/* Property 2 Search */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-secondary">Property 2</h3>
              <div className="form-control relative">
                <input
                  type="text"
                  placeholder="Search for a property..."
                  className="input input-bordered w-full"
                  value={searchTerm2}
                  onChange={(e) => setSearchTerm2(e.target.value)}
                  disabled={!!selectedProperty2}
                />
                {loading2 && (
                  <span className="loading loading-spinner loading-sm absolute right-3 top-3"></span>
                )}

                {/* Search Results Dropdown */}
                {searchResults2.length > 0 && !selectedProperty2 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-base-100 shadow-xl rounded-lg max-h-64 overflow-y-auto z-10 border border-base-300">
                    {searchResults2.map((property) => (
                      <div
                        key={property._id}
                        className="p-3 hover:bg-base-200 cursor-pointer border-b border-base-300 last:border-b-0"
                        onClick={() => selectProperty2(property)}
                      >
                        <p className="font-semibold">{property.title}</p>
                        <p className="text-sm opacity-70">
                          {property.address.city} - ৳{property.rent}/month
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedProperty2 && (
                <div className="mt-4">
                  <PropertyCard property={selectedProperty2} side={2} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        {!selectedProperty1 && !selectedProperty2 && (
          <div className="alert alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>
              Start typing in either search box to find properties. You can
              compare prices, locations, amenities, and more!
            </span>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ComparePage;
