import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";
import {
  getTenantProfile,
  updateTenantProfile,
  getTenantWishlist,
  removeFromWishlist,
} from "../api/tenantApi";
import {
  getMyBookings,
  getMyCurrentProperty,
  cancelBooking,
  leaveProperty,
} from "../api/bookingApi";

const TenantProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [currentProperty, setCurrentProperty] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bookingsFetched, setBookingsFetched] = useState(false);
  const [wishlistFetched, setWishlistFetched] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gender: "",
    occupation: "",
    dateOfBirth: "",
    bio: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    } else {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "tenant") {
        navigate("/");
      } else {
        fetchTenantData();
      }
    }
  }, []);

  const fetchTenantData = async () => {
    try {
      setLoading(true);
      const profileData = await getTenantProfile();
      setUser(profileData.user);
      setFormData({
        name: profileData.user.name || "",
        phone: profileData.user.phone || "",
        gender: profileData.user.gender || "",
        occupation: profileData.user.occupation || "",
        dateOfBirth: profileData.user.dateOfBirth
          ? new Date(profileData.user.dateOfBirth).toISOString().split("T")[0]
          : "",
        bio: profileData.user.bio || "",
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);
      const data = await getMyBookings();
      setBookings(data.bookings);
      setBookingsFetched(true);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load bookings");
      setBookingsFetched(true);
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchCurrentProperty = async () => {
    try {
      const data = await getMyCurrentProperty();
      setCurrentProperty(data.booking);
    } catch (err) {
      console.error("Error fetching current property:", err);
    }
  };

  const fetchWishlist = async () => {
    try {
      const data = await getTenantWishlist();
      setWishlist(data.wishlist);
      setWishlistFetched(true);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setError("Failed to load wishlist");
      setWishlistFetched(true);
    }
  };

  useEffect(() => {
    if (activeTab === "bookings" && !bookingsFetched) {
      fetchBookings();
      fetchCurrentProperty();
    } else if (activeTab === "wishlist" && !wishlistFetched) {
      fetchWishlist();
    }
  }, [activeTab, bookingsFetched, wishlistFetched]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const data = await updateTenantProfile(formData);
      setUser(data.user);
      setIsEditing(false);
      setSuccess("Profile updated successfully!");

      // Update localStorage
      localStorage.setItem("user", JSON.stringify(data.user));

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handleRemoveFromWishlist = async (propertyId) => {
    try {
      await removeFromWishlist(propertyId);
      setWishlist(wishlist.filter((item) => item._id !== propertyId));
      setSuccess("Removed from wishlist!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      setError("Failed to remove from wishlist");
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/authentication/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      setBookingsLoading(true);
      const response = await cancelBooking(bookingId);
      setSuccess(response.message);
      await fetchBookings();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel booking");
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleLeaveProperty = async () => {
    if (
      !window.confirm(
        "Are you sure you want to leave this property? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setBookingsLoading(true);
      const response = await leaveProperty();
      setSuccess(response.message);
      await fetchCurrentProperty();
      await fetchBookings();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to leave property");
    } finally {
      setBookingsLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const badges = {
      pending: "badge-warning",
      approved: "badge-success",
      active: "badge-info",
      rejected: "badge-error",
      cancelled: "badge-ghost",
      completed: "badge-neutral",
    };
    return badges[status] || "badge-ghost";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!user) return null;

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
          <button onClick={() => navigate("/")} className="btn btn-ghost">
            Home
          </button>
          <button onClick={handleLogout} className="btn btn-error">
            Logout
          </button>
        </div>
      </div>

      <div className="container mx-auto p-4 md:p-8">
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

        {/* Profile Header */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <div className="avatar placeholder">
                <div className="bg-neutral text-neutral-content rounded-full w-20">
                  <span className="text-3xl">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div>
                <h2 className="card-title text-3xl">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex gap-2 mt-2">
                  <span className="badge badge-primary capitalize">
                    {user.role}
                  </span>
                  {user.averageRating > 0 && (
                    <span className="badge badge-accent">
                      ⭐ {user.averageRating.toFixed(1)} ({user.totalRatings}{" "}
                      reviews)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed mb-6">
          <a
            className={`tab ${activeTab === "profile" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
             Profile
          </a>
          <a
            className={`tab ${activeTab === "bookings" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("bookings")}
          >
             Bookings
          </a>
          <a
            className={`tab ${activeTab === "wishlist" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("wishlist")}
          >
             Wishlist
          </a>
        </div>

        {/* Tab Content */}
        {activeTab === "profile" && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">Profile Information</h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-primary btn-sm"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {!isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-gray-600">Name</p>
                      <p className="text-lg">{user.name}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-600">Email</p>
                      <p className="text-lg">{user.email}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-600">Phone</p>
                      <p className="text-lg">{user.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-600">Gender</p>
                      <p className="text-lg capitalize">
                        {user.gender || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-600">Occupation</p>
                      <p className="text-lg">
                        {user.occupation || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-600">
                        Date of Birth
                      </p>
                      <p className="text-lg">
                        {user.dateOfBirth
                          ? new Date(user.dateOfBirth).toLocaleDateString()
                          : "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Bio</p>
                    <p className="text-lg">{user.bio || "No bio yet"}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Member Since</p>
                    <p className="text-lg">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Name</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="input input-bordered"
                        required
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Phone</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="input input-bordered"
                        required
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Gender</span>
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="select select-bordered"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Occupation</span>
                      </label>
                      <input
                        type="text"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleInputChange}
                        className="input input-bordered"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Date of Birth</span>
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="input input-bordered"
                      />
                    </div>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Bio</span>
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="textarea textarea-bordered h-24"
                      placeholder="Tell us about yourself..."
                    ></textarea>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: user.name || "",
                          phone: user.phone || "",
                          gender: user.gender || "",
                          occupation: user.occupation || "",
                          dateOfBirth: user.dateOfBirth
                            ? new Date(user.dateOfBirth)
                                .toISOString()
                                .split("T")[0]
                            : "",
                          bio: user.bio || "",
                        });
                      }}
                      className="btn btn-ghost"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="space-y-6">
            {/* Current Property */}
            {currentProperty && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-success">
                    Current Property ✓
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold">
                        {currentProperty.property.title}
                      </p>
                      <p className="text-sm opacity-70">
                        {currentProperty.property.address.street},{" "}
                        {currentProperty.property.address.city}
                      </p>
                      <p className="text-sm mt-2">
                        <span className="font-semibold">Rent:</span> BDT{" "}
                        {currentProperty.property.rent}/month
                      </p>
                      {currentProperty.moveInDate && (
                        <p className="text-sm">
                          <span className="font-semibold">Move-in:</span>{" "}
                          {new Date(
                            currentProperty.moveInDate
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-end">
                      <button
                        onClick={handleLeaveProperty}
                        className="btn btn-error btn-outline"
                        disabled={bookingsLoading}
                      >
                        Leave Property
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* All Bookings */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">All My Bookings</h2>

                {bookingsLoading ? (
                  <div className="flex justify-center py-8">
                    <span className="loading loading-spinner loading-lg"></span>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-8 opacity-50">
                    <p>No bookings yet</p>
                    <button
                      onClick={() => navigate("/")}
                      className="btn btn-primary btn-sm mt-4"
                    >
                      Browse Properties
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking._id} className="card bg-base-200">
                        <div className="card-body p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">
                                  {booking.property.title}
                                </h3>
                                <span
                                  className={`badge ${getStatusBadgeClass(
                                    booking.status
                                  )}`}
                                >
                                  {booking.status}
                                </span>
                                <span className="badge badge-outline capitalize">
                                  {booking.bookingType}
                                </span>
                              </div>
                              <p className="text-sm opacity-70">
                                {booking.property.address.city} • BDT{" "}
                                {booking.property.rent}/month
                              </p>

                              {booking.bookingType === "visit" && (
                                <div className="text-sm mt-2">
                                  <p>
                                    <span className="font-semibold">
                                      Proposed Date:
                                    </span>{" "}
                                    {new Date(
                                      booking.proposedDate
                                    ).toLocaleDateString()}
                                  </p>
                                  {booking.approvedVisitTime && (
                                    <p className="text-success">
                                      <span className="font-semibold">
                                        Approved Time:
                                      </span>{" "}
                                      {booking.approvedVisitTime}
                                    </p>
                                  )}
                                </div>
                              )}

                              {booking.bookingType === "booking" &&
                                booking.moveInDate && (
                                  <div className="text-sm mt-2">
                                    <p>
                                      <span className="font-semibold">
                                        Move-in:
                                      </span>{" "}
                                      {new Date(
                                        booking.moveInDate
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                )}
                            </div>

                            {booking.status === "pending" && (
                              <button
                                onClick={() => handleCancelBooking(booking._id)}
                                className="btn btn-error btn-sm btn-outline"
                                disabled={bookingsLoading}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "wishlist" && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">My Wishlist</h3>
            {wishlist.length === 0 ? (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body text-center">
                  <p className="text-gray-600">Your wishlist is empty.</p>
                  <button
                    onClick={() => navigate("/")}
                    className="btn btn-primary mt-4"
                  >
                    Browse Properties
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wishlist.map((property) => (
                  <div
                    key={property._id}
                    className="card bg-base-100 shadow-xl"
                  >
                    {property.images?.[0] && (
                      <figure className="h-48">
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      </figure>
                    )}
                    <div className="card-body">
                      <h4 className="card-title">{property.title}</h4>
                      <p className="text-gray-600 text-sm">
                        📍{" "}
                        {property.address?.street &&
                          `${property.address.street}, `}
                        {property.address?.city}
                        {property.address?.state &&
                          `, ${property.address.state}`}
                      </p>
                      <p className="text-xl font-semibold text-primary">
                        ${property.rent}/month
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className="badge badge-sm">
                          {property.availableRooms} rooms available
                        </span>
                        {property.isAvailable && (
                          <span className="badge badge-success badge-sm">
                            Available
                          </span>
                        )}
                      </div>
                      <div className="card-actions justify-end mt-4">
                        <button
                          onClick={() => navigate(`/property/${property._id}`)}
                          className="btn btn-primary btn-sm"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleRemoveFromWishlist(property._id)}
                          className="btn btn-error btn-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantProfilePage;
