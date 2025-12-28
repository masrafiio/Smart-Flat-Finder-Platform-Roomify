import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { createReport } from "../api/reportApi";

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [properties, setProperties] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Report modal states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDescription, setReportDescription] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    // Get current user from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tenant/profile/${userId}`);
      setUser(response.data);

      // If landlord, fetch their properties
      if (response.data.role === "landlord") {
        try {
          const propertiesResponse = await api.get(
            `/landlord/properties/${userId}`
          );
          setProperties(propertiesResponse.data || []);
        } catch {
          setProperties([]);
        }
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError(err.response?.data?.message || "Failed to fetch user profile");
    } finally {
      setLoading(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    
    setReportLoading(true);
    setError("");
    setSuccess("");
    
    try {
      await createReport({
        reportedItem: userId,
        itemType: "user",
        description: reportDescription
      });
      
      setSuccess("Report submitted successfully!");
      setShowReportModal(false);
      setReportDescription("");
      
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error submitting report:", err);
      setError(err.response?.data?.message || "Failed to submit report");
    } finally {
      setReportLoading(false);
    }
  };

  const canReportUser = () => {
    if (!currentUser || !user) return false;
    
    // Don't allow self-reporting
    if (currentUser.id === userId) return false;
    
    // Landlords can report tenants and vice versa
    if (currentUser.role === "landlord" && user.role === "tenant") return true;
    if (currentUser.role === "tenant" && user.role === "landlord") return true;
    
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <div className="flex justify-center items-center min-h-[60vh]">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
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
            <span>{error || "User not found"}</span>
          </div>
          <button onClick={() => navigate(-1)} className="btn btn-primary mt-4">
            Go Back
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Alert Messages */}
        {error && (
          <div className="alert alert-error mb-4">
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
        )}

        {success && (
          <div className="alert alert-success mb-4">
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{success}</span>
          </div>
        )}
        
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="btn btn-ghost mb-4">
          ← Back
        </button>

        {/* Profile Header */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div className="flex items-start gap-6">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-24">
                  <span className="text-3xl">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{user.name}</h1>
                    <div className="badge badge-primary capitalize">
                      {user.role}
                    </div>
                    {user.verificationStatus === "approved" && (
                      <div className="badge badge-success">Verified</div>
                    )}
                  </div>
                  
                  {/* Report Button */}
                  {canReportUser() && (
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="btn btn-error btn-sm"
                    >
                       Report User
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm opacity-70">Email</p>
                    <p className="font-semibold">{user.email}</p>
                  </div>

                  {user.phone && (
                    <div>
                      <p className="text-sm opacity-70">Phone</p>
                      <p className="font-semibold">{user.phone}</p>
                    </div>
                  )}

                  {user.gender && (
                    <div>
                      <p className="text-sm opacity-70">Gender</p>
                      <p className="font-semibold capitalize">{user.gender}</p>
                    </div>
                  )}

                  {user.occupation && (
                    <div>
                      <p className="text-sm opacity-70">Occupation</p>
                      <p className="font-semibold">{user.occupation}</p>
                    </div>
                  )}
                </div>

                {user.bio && (
                  <div className="mt-4">
                    <p className="text-sm opacity-70">Bio</p>
                    <p className="mt-1">{user.bio}</p>
                  </div>
                )}

                <div className="mt-4">
                  <p className="text-sm opacity-70">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Rating Display */}
                {user.averageRating > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <div className="rating rating-sm">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <input
                            key={star}
                            type="radio"
                            name="rating-display"
                            className="mask mask-star-2 bg-warning"
                            checked={star === Math.round(user.averageRating)}
                            readOnly
                          />
                        ))}
                      </div>
                      <span className="font-semibold">
                        {user.averageRating.toFixed(1)}
                      </span>
                      <span className="text-sm opacity-70">
                        ({user.totalRatings}{" "}
                        {user.totalRatings === 1 ? "rating" : "ratings"})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Landlord's Properties */}
        {user.role === "landlord" && properties.length > 0 && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Properties by {user.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {properties.map((property) => (
                  <div
                    key={property._id}
                    className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/property/${property._id}`)}
                  >
                    {property.images && property.images.length > 0 && (
                      <figure className="h-48">
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      </figure>
                    )}
                    <div className="card-body p-4">
                      <h3 className="card-title text-lg">{property.title}</h3>
                      <p className="text-sm opacity-70">
                        {property.address.city}, {property.address.state}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-lg font-bold text-primary">
                          ${property.rent}/month
                        </span>
                        <span className="badge badge-outline">
                          {property.availableRooms} rooms
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Report {user.name}</h3>
            <p className="text-sm opacity-70 mb-4">
              Please provide details about why you're reporting this user.
            </p>

            <form onSubmit={handleReportSubmit}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-32"
                  placeholder="Please describe the issue in detail..."
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  required
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowReportModal(false);
                    setReportDescription("");
                    setError("");
                  }}
                  disabled={reportLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-error"
                  disabled={reportLoading}
                >
                  {reportLoading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    "Submit Report"
                  )}
                </button>
              </div>
            </form>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => {
              setShowReportModal(false);
              setReportDescription("");
              setError("");
            }}
          ></div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default UserProfilePage;
