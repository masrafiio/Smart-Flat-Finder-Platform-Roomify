import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const HomePage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      // Redirect admin to their dashboard
      if (parsedUser.role === "admin") {
        navigate("/admin-dashboard");
        return;
      }
    }
    fetchProperties();
  }, [navigate]);

  const fetchProperties = async (filterParams = {}) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      Object.entries(filterParams).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/property?${params.toString()}`);
      const allProperties = response.data.properties || [];

      // Shuffle properties randomly
      const shuffled = [...allProperties].sort(() => Math.random() - 0.5);

      // Take only first 9 properties
      const limitedProperties = shuffled.slice(0, 9);

      setProperties(limitedProperties);
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError("Failed to load properties. Please try again later.");
    } finally {
      setLoading(false);
    }
  };



  const handlePropertyClick = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <div className="hero bg-gradient-to-r from-primary to-secondary text-primary-content py-20">


        {/* Properties Section */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : error ? (
          <div className="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏚️</div>
            <h2 className="text-2xl font-bold mb-2">No Properties Found</h2>
            <p className="text-base-content/70">
              Try adjusting your filters or check back later for new listings.
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                Available Properties ({properties.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {properties.map((property) => (
                <div
                  key={property._id}
                  onClick={() => handlePropertyClick(property._id)}
                  className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2"
                >
                  <figure className="h-48 overflow-hidden">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-base-300 flex items-center justify-center">
                        <span className="text-6xl">🏠</span>
                      </div>
                    )}
                  </figure>

                  <div className="card-body">
                    <div className="flex justify-between items-start">
                      <h2 className="card-title text-lg">{property.title}</h2>
                      <div className="badge badge-primary">
                        {property.propertyType}
                      </div>
                    </div>

                    <p className="text-sm text-base-content/70 line-clamp-2">
                      {property.description}
                    </p>

                    <div className="flex items-center gap-2 text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>
                        {property.address?.city},{" "}
                        {property.address?.state || property.address?.country}
                      </span>
                    </div>

                    <div className="divider my-2"></div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          ${property.rent}
                          <span className="text-sm font-normal text-base-content/70">
                            /month
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="badge badge-outline">
                          {property.availableRooms}/{property.totalRooms} rooms
                        </div>
                      </div>
                    </div>

                    {property.amenities && property.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {property.amenities
                          .slice(0, 3)
                          .map((amenity, index) => (
                            <span key={index} className="badge badge-sm">
                              {amenity}
                            </span>
                          ))}
                        {property.amenities.length > 3 && (
                          <span className="badge badge-sm">
                            +{property.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="card-actions justify-end mt-4">
                      <button className="btn btn-primary btn-sm">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
