import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  getPropertyReviews,
  createPropertyReview,
  rateUser,
  getMyRatingForUser,
} from "../api/reviewApi";
import { addToWishlist, getTenantWishlist } from "../api/tenantApi";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Review states
  const [reviews, setReviews] = useState([]);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Rating states for landlord
  const [landlordRating, setLandlordRating] = useState(0);
  const [myRating, setMyRating] = useState(null);
  const [showRatingForm, setShowRatingForm] = useState(false);

  // Wishlist state
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchPropertyDetails();
    checkIfInWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/property/${id}`);
      setProperty(response.data);

      // Fetch reviews
      await fetchReviews();

      // Fetch my rating for landlord if user is tenant
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role === "tenant" && response.data.landlord) {
          try {
            const rating = await getMyRatingForUser(response.data.landlord._id);
            setMyRating(rating);
            setLandlordRating(rating.rating);
          } catch {
            // User hasn't rated yet
            setMyRating(null);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching property:", err);
      setError(
        err.response?.data?.message || "Failed to fetch property details"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await getPropertyReviews(id);
      setReviews(data.reviews || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const checkIfInWishlist = async () => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) return;

      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "tenant") return;

      const data = await getTenantWishlist();
      const isPropertyInWishlist = data.wishlist.some(
        (item) => item._id === id
      );
      setIsInWishlist(isPropertyInWishlist);
    } catch (err) {
      console.error("Error checking wishlist:", err);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setReviewLoading(true);
    setError("");

    try {
      await createPropertyReview(id, reviewComment);
      setReviewComment("");
      await fetchReviews();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post comment");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (landlordRating === 0) {
      setError("Please select a rating");
      return;
    }

    setReviewLoading(true);
    setError("");

    try {
      await rateUser({
        userId: property.landlord._id,
        rating: landlordRating,
        propertyId: id,
      });

      // Refresh rating
      const rating = await getMyRatingForUser(property.landlord._id);
      setMyRating(rating);
      setShowRatingForm(false);

      // Refresh property to update landlord rating
      await fetchPropertyDetails();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit rating");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      setError("Please login to add to wishlist");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    if (user.role !== "tenant") {
      setError("Only tenants can add properties to wishlist");
      return;
    }

    setIsAddingToWishlist(true);
    setError("");
    setSuccess("");

    try {
      await addToWishlist(id);
      setIsInWishlist(true);
      setSuccess("Property added to wishlist successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add to wishlist");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-base-200 flex flex-col">
        <Navbar />
        <div className="flex-grow container mx-auto p-8">
          <div className="alert alert-error">
            <span>{error || "Property not found"}</span>
          </div>
          <button
            onClick={() => navigate("/")}
            className="btn btn-primary mt-4"
          >
            Back to Home
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Extract embed URL from Google Maps link
  const getEmbedUrl = (link) => {
    if (!link) return null;
    // If it's already an embed URL, return it
    if (link.includes("/embed")) return link;
    // Convert regular Google Maps link to embed URL
    if (link.includes("google.com/maps")) {
      return link.replace("/maps?", "/maps/embed?");
    }
    return link;
  };

  const googleMapsUrl = property.googleMapsLink
    ? getEmbedUrl(property.googleMapsLink)
    : null;

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <Navbar />

      <div className="flex-grow container mx-auto p-4 md:p-8">
        {/* Alert Messages */}
        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="alert alert-success mb-4">
            <span>{success}</span>
          </div>
        )}

        {/* Property Header */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">{property.title}</h1>
                <p className="text-lg opacity-70 mt-2">
                  📍 {property.address.street && `${property.address.street}, `}
                  {property.address.city}, {property.address.state}{" "}
                  {property.address.zipCode}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">
                  ${property.rent}
                </p>
                <p className="text-sm opacity-70">per month</p>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex gap-2 mt-4">
              <span
                className={`badge ${
                  property.isAvailable ? "badge-success" : "badge-error"
                }`}
              >
                {property.isAvailable ? "Available" : "Not Available"}
              </span>
              <span className="badge badge-outline capitalize">
                {property.propertyType}
              </span>
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
                  <div
                    key={index}
                    className="aspect-video bg-base-300 rounded-lg overflow-hidden"
                  >
                    <img
                      src={image}
                      alt={`Property ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/400x300?text=Image+Not+Available";
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
                    <div className="stat-value text-primary">
                      {property.totalRooms}
                    </div>
                  </div>
                  <div className="stat bg-base-200 rounded-box">
                    <div className="stat-title">Available</div>
                    <div className="stat-value text-success">
                      {property.availableRooms}
                    </div>
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
            {property.tenants && property.tenants.length > 0 && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">
                    Current Tenants ({property.tenants.length})
                  </h2>
                  <p className="text-sm opacity-70 mb-4">
                    Get to know who you'll be living with
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.tenants.map((tenant) => (
                      <div key={tenant._id} className="card bg-base-200">
                        <div className="card-body p-4">
                          <div className="flex items-center justify-between">
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
                            <button
                              onClick={() => navigate(`/user/${tenant._id}`)}
                              className="btn btn-sm btn-primary"
                            >
                              View Profile
                            </button>
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
                      <span
                        key={index}
                        className="badge badge-lg badge-outline"
                      >
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
                      <span className="font-bold">
                        ${property.securityDeposit}
                      </span>
                    </div>
                  )}
                  <div className="divider my-2"></div>
                  {property.availableFrom && (
                    <div className="flex justify-between text-sm">
                      <span>Available From</span>
                      <span>
                        {new Date(property.availableFrom).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => navigate("/booking", { state: { property } })}
                  className="btn btn-primary btn-block mt-4"
                  disabled={
                    !property.isAvailable || property.availableRooms === 0
                  }
                >
                  Request Booking
                </button>
                <button 
                  onClick={handleAddToWishlist}
                  className={`btn btn-block ${
                    isInWishlist ? "btn-success" : "btn-outline"
                  }`}
                  disabled={isAddingToWishlist || isInWishlist}
                >
                  {isAddingToWishlist ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Adding...
                    </>
                  ) : isInWishlist ? (
                    <>
                      ✓ Added to Wishlist
                    </>
                  ) : (
                    "Add to Wishlist"
                  )}
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
                      <p className="font-bold text-lg">
                        {property.landlord.name}
                      </p>
                      {property.landlord.averageRating > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span>
                            {property.landlord.averageRating.toFixed(1)}
                          </span>
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
                      <a
                        href={`mailto:${property.landlord.email}`}
                        className="link"
                      >
                        {property.landlord.email}
                      </a>
                    </p>
                    {property.landlord.phone && (
                      <p className="text-sm">
                        <span className="opacity-70">Phone:</span>{" "}
                        <a
                          href={`tel:${property.landlord.phone}`}
                          className="link"
                        >
                          {property.landlord.phone}
                        </a>
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(`/user/${property.landlord._id}`)}
                    className="btn btn-outline btn-sm mt-4"
                  >
                    View Profile
                  </button>
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
                        <span className="font-semibold">
                          {property.totalReviews}
                        </span>
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

            {/* Rate Landlord - Only for Tenants */}
            {user && user.role === "tenant" && property.landlord && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Rate This Landlord</h2>

                  {myRating && !showRatingForm ? (
                    <div>
                      <div className="alert alert-success mb-4">
                        <span>
                          You rated this landlord {myRating.rating}/5 ★
                        </span>
                      </div>
                      <button
                        onClick={() => setShowRatingForm(true)}
                        className="btn btn-outline btn-sm btn-block"
                      >
                        Update Rating
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitRating}>
                      <div className="form-control mb-4">
                        <label className="label">
                          <span className="label-text">Your Rating</span>
                        </label>
                        <div className="flex gap-2 justify-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setLandlordRating(star)}
                              className={`text-3xl ${
                                star <= landlordRating
                                  ? "text-yellow-500"
                                  : "text-gray-300"
                              }`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="btn btn-primary flex-1"
                          disabled={reviewLoading || landlordRating === 0}
                        >
                          {reviewLoading ? (
                            <span className="loading loading-spinner"></span>
                          ) : myRating ? (
                            "Update"
                          ) : (
                            "Submit"
                          )}
                        </button>
                        {myRating && showRatingForm && (
                          <button
                            type="button"
                            onClick={() => setShowRatingForm(false)}
                            className="btn btn-ghost"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Property Comments Section - Full Width Below */}
        <div className="card bg-base-100 shadow-xl mt-6">
          <div className="card-body">
            <h2 className="card-title mb-4">
              Property Comments ({reviews.length})
            </h2>

            {/* Comment Form - Only for logged-in users */}
            {user && (
              <form onSubmit={handleSubmitComment} className="mb-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Share your thoughts about this property
                    </span>
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="textarea textarea-bordered h-24"
                    placeholder="Write a comment..."
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary mt-4"
                  disabled={reviewLoading || !reviewComment.trim()}
                >
                  {reviewLoading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    "Post Comment"
                  )}
                </button>
              </form>
            )}

            {/* Error Display */}
            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}

            {/* Comments List */}
            {reviews.length === 0 ? (
              <div className="text-center py-8 opacity-50">
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="card bg-base-200">
                    <div className="card-body p-4">
                      <div className="flex items-start gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-primary text-primary-content rounded-full w-10">
                            <span className="text-sm">
                              {review.reviewer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold">
                              {review.reviewer.name}
                            </p>
                            <span className="text-xs opacity-70">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm opacity-70 capitalize">
                            {review.reviewer.role}
                          </p>
                          <p className="mt-2">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PropertyDetails;
