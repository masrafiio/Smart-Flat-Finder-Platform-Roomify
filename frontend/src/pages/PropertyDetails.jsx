import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/axios";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/property/${id}`);
      setProperty(response.data);
    } catch (err) {
      console.error("Error fetching property:", err);
      setError(err.response?.data?.message || "Failed to fetch property details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertyDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-base-200">
        <div className="navbar bg-base-100 shadow-lg">
          <div className="flex-1">
            <a onClick={() => navigate("/")} className="btn btn-ghost text-xl">
              🏠 Roomify
            </a>
          </div>
          <div className="flex-none">
            <button onClick={() => navigate("/")} className="btn btn-ghost">
              Back to Home
            </button>
          </div>
        </div>
        <div className="container mx-auto p-8">
          <div className="alert alert-error">
            <span>{error || "Property not found"}</span>
          </div>
        </div>
      </div>
    );
  }

  // Extract embed URL from Google Maps link
  const getEmbedUrl = (link) => {
    if (!link) return null;
    // If it's already an embed URL, return it
    if (link.includes('/embed')) return link;
    // Convert regular Google Maps link to embed URL
    if (link.includes('google.com/maps')) {
      return link.replace('/maps?', '/maps/embed?');
    }
    return link;
  };
  
  const googleMapsUrl = property.googleMapsLink ? getEmbedUrl(property.googleMapsLink) : null;

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-lg">
        <div className="flex-1">
          <a onClick={() => navigate("/")} className="btn btn-ghost text-xl">
            🏠 Roomify
          </a>
        </div>
        <div className="flex-none gap-2">
          <button onClick={() => navigate(-1)} className="btn btn-ghost">
            ← Back
          </button>
          <button onClick={() => navigate("/")} className="btn btn-ghost">
            Home
          </button>
        </div>
      </div>

      <div className="container mx-auto p-4 md:p-8">
        {/* Property Header */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">{property.title}</h1>
                <p className="text-lg opacity-70 mt-2">
                  📍 {property.address.street && `${property.address.street}, `}
                  {property.address.city}, {property.address.state} {property.address.zipCode}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">${property.rent}</p>
                <p className="text-sm opacity-70">per month</p>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex gap-2 mt-4">
              <span className={`badge ${property.isAvailable ? "badge-success" : "badge-error"}`}>
                {property.isAvailable ? "Available" : "Not Available"}
              </span>
              <span className="badge badge-outline capitalize">{property.propertyType}</span>
              {property.verificationStatus === "approved" && (
                <span className="badge badge-info">✓ Verified</span>
              )}
            </div>
          </div>
        </div>

        {/* Images Gallery */}
        {property.images && property.images.length > 0 && (
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title">Photos</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {property.images.map((image, index) => (
                  <div key={index} className="aspect-video bg-base-300 rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`Property ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Available";
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Description</h2>
                <p className="whitespace-pre-line">{property.description}</p>
              </div>
            </div>

            {/* Room Details */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Room Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="stat bg-base-200 rounded-box">
                    <div className="stat-title">Total Rooms</div>
                    <div className="stat-value text-primary">{property.totalRooms}</div>
                  </div>
                  <div className="stat bg-base-200 rounded-box">
                    <div className="stat-title">Available</div>
                    <div className="stat-value text-success">{property.availableRooms}</div>
                  </div>
                  <div className="stat bg-base-200 rounded-box">
                    <div className="stat-title">Occupied</div>
                    <div className="stat-value text-warning">
                      {property.totalRooms - property.availableRooms}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Tenants */}
            {property.currentTenants && property.currentTenants.length > 0 && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">
                    Current Tenants ({property.currentTenants.length})
                  </h2>
                  <p className="text-sm opacity-70 mb-4">
                    Get to know who you'll be living with
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.currentTenants.map((tenant, index) => (
                      <div key={index} className="card bg-base-200">
                        <div className="card-body p-4">
                          <div className="flex items-center gap-3">
                            <div className="avatar placeholder">
                              <div className="bg-primary text-primary-content rounded-full w-12">
                                <span className="text-xl">
                                  {tenant.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="font-semibold">{tenant.name}</p>
                              <p className="text-xs opacity-70">
                                {tenant.gender} • {tenant.occupation}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity, index) => (
                      <span key={index} className="badge badge-lg badge-outline">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Google Maps */}
            {googleMapsUrl && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Location on Map</h2>
                  <div className="w-full h-96 rounded-lg overflow-hidden">
                    <iframe
                      src={googleMapsUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                  <a
                    href={property.googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm mt-2"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Pricing</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Monthly Rent</span>
                    <span className="font-bold">${property.rent}</span>
                  </div>
                  {property.securityDeposit > 0 && (
                    <div className="flex justify-between">
                      <span>Security Deposit</span>
                      <span className="font-bold">${property.securityDeposit}</span>
                    </div>
                  )}
                  <div className="divider my-2"></div>
                  {property.availableFrom && (
                    <div className="flex justify-between text-sm">
                      <span>Available From</span>
                      <span>{new Date(property.availableFrom).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <button className="btn btn-primary btn-block mt-4">
                  Contact Landlord
                </button>
                <button className="btn btn-outline btn-block">
                  Add to Wishlist
                </button>
              </div>
            </div>

            {/* Landlord Info */}
            {property.landlord && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Landlord</h2>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="avatar placeholder">
                      <div className="bg-primary text-primary-content rounded-full w-16">
                        <span className="text-2xl">
                          {property.landlord.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-lg">{property.landlord.name}</p>
                      {property.landlord.averageRating > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span>{property.landlord.averageRating.toFixed(1)}</span>
                          <span className="text-xs opacity-70">
                            ({property.landlord.totalRatings} reviews)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="opacity-70">Email:</span>{" "}
                      <a href={`mailto:${property.landlord.email}`} className="link">
                        {property.landlord.email}
                      </a>
                    </p>
                    {property.landlord.phone && (
                      <p className="text-sm">
                        <span className="opacity-70">Phone:</span>{" "}
                        <a href={`tel:${property.landlord.phone}`} className="link">
                          {property.landlord.phone}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Property Stats */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Property Stats</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="opacity-70">Views</span>
                    <span className="font-semibold">{property.viewCount}</span>
                  </div>
                  {property.averageRating > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="opacity-70">Rating</span>
                        <span className="font-semibold">
                          {property.averageRating.toFixed(1)} ★
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-70">Reviews</span>
                        <span className="font-semibold">{property.totalReviews}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="opacity-70">Listed</span>
                    <span className="font-semibold">
                      {new Date(property.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
