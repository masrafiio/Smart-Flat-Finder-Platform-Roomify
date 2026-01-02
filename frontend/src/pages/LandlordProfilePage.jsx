import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";
import {
  getLandlordProfile,
  updateLandlordProfile,
  getLandlordProperties,
  getLandlordStats,
  createProperty,
  updateProperty,
  deleteProperty,
  addCurrentTenant,
  removeCurrentTenant,
} from "../api/landlordApi";
import {
  getLandlordBookings,
  acceptBooking,
  rejectBooking,
} from "../api/bookingApi";

const LandlordProfilePage = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, profile, properties, addProperty, bookings
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [bookingFilter, setBookingFilter] = useState("pending");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [approvedVisitTime, setApprovedVisitTime] = useState("");

  // Profile edit state
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    gender: "",
    occupation: "",
    bio: "",
  });

  // Property form state
  const [propertyForm, setPropertyForm] = useState({
    title: "",
    description: "",
    propertyType: "room",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA",
    },
    googleMapsLink: "",
    rent: "",
    securityDeposit: "",
    totalRooms: "",
    availableRooms: "",
    amenities: "",
    images: "",
    availableFrom: "",
  });

  // Edit property state
  const [editingProperty, setEditingProperty] = useState(null);

  // Tenant form state
  const [tenantForm, setTenantForm] = useState({
    name: "",
    gender: "",
    occupation: "",
  });
  const [addingTenantTo, setAddingTenantTo] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    } else {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "landlord") {
        navigate("/");
      } else {
        setUser(parsedUser);
        fetchData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileData, propertiesData, statsData] = await Promise.all([
        getLandlordProfile(),
        getLandlordProperties(),
        getLandlordStats(),
      ]);
      setProfile(profileData);
      setProperties(propertiesData.properties || []);
      setStats(statsData);

      // Set profile form data
      setProfileForm({
        name: profileData.name || "",
        phone: profileData.phone || "",
        gender: profileData.gender || "",
        occupation: profileData.occupation || "",
        bio: profileData.bio || "",
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
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

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const response = await updateLandlordProfile(profileForm);
      setProfile(response.user);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePropertySubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const propertyData = {
        ...propertyForm,
        rent: Number(propertyForm.rent),
        securityDeposit: Number(propertyForm.securityDeposit),
        totalRooms: Number(propertyForm.totalRooms),
        availableRooms: Number(propertyForm.availableRooms),
        amenities: propertyForm.amenities
          .split(",")
          .map((a) => a.trim())
          .filter((a) => a),
        images: propertyForm.images
          .split(",")
          .map((i) => i.trim())
          .filter((i) => i),
        googleMapsLink: propertyForm.googleMapsLink || "",
      };

      if (editingProperty) {
        const response = await updateProperty(editingProperty._id, propertyData);
        setSuccess("Property updated successfully!");
        // Update the property in the local state immediately
        setProperties(properties.map(p => 
          p._id === editingProperty._id ? response.property : p
        ));
      } else {
        await createProperty(propertyData);
        setSuccess("Property created successfully!");
      }

      // Reset form and refresh
      setPropertyForm({
        title: "",
        description: "",
        propertyType: "room",
        address: {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "USA",
        },
        googleMapsLink: "",
        rent: "",
        securityDeposit: "",
        totalRooms: "",
        availableRooms: "",
        amenities: "",
        images: "",
        availableFrom: "",
      });
      setEditingProperty(null);
      setActiveTab("properties");
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save property");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    try {
      setLoading(true);
      await deleteProperty(propertyId);
      setSuccess("Property deleted successfully!");
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete property");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setPropertyForm({
      title: property.title,
      description: property.description,
      propertyType: property.propertyType,
      address: property.address,
      googleMapsLink: property.googleMapsLink || "",
      rent: property.rent,
      securityDeposit: property.securityDeposit,
      totalRooms: property.totalRooms,
      availableRooms: property.availableRooms,
      amenities: property.amenities.join(", "),
      images: property.images.join(", "),
      availableFrom: property.availableFrom
        ? new Date(property.availableFrom).toISOString().split("T")[0]
        : "",
    });
    setActiveTab("addProperty");
  };

  const handleAddTenant = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await addCurrentTenant(addingTenantTo, tenantForm);
      setSuccess("Tenant added successfully!");
      setTenantForm({ name: "", gender: "", occupation: "" });
      setAddingTenantTo(null);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add tenant");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTenant = async (propertyId, tenantId) => {
    if (!confirm("Are you sure you want to remove this tenant?")) return;

    try {
      setLoading(true);
      await removeCurrentTenant(propertyId, tenantId);
      setSuccess("Tenant removed successfully!");
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove tenant");
    } finally {
      setLoading(false);
    }
  };

  // Booking functions
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const filters = bookingFilter !== "all" ? { status: bookingFilter } : {};
      const data = await getLandlordBookings(filters);
      setBookings(data.bookings || []);
    } catch {
      setError("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "bookings") {
      fetchBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, bookingFilter]);

  const handleAcceptBooking = async (booking) => {
    setError("");
    setSuccess("");

    // For visit type, validate time selection
    if (booking.bookingType === "visit" && !approvedVisitTime) {
      setError("Please select a visit time");
      return;
    }

    try {
      setLoading(true);
      const data = {};
      if (booking.bookingType === "visit") {
        data.approvedVisitTime = approvedVisitTime;
      }

      const response = await acceptBooking(booking._id, data);
      setSuccess(response.message);
      setSelectedBooking(null);
      setApprovedVisitTime("");
      document.getElementById("accept_modal").close();
      await fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept booking");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectBooking = async (bookingId) => {
    setError("");
    setSuccess("");

    try {
      setLoading(true);
      const response = await rejectBooking(bookingId);
      setSuccess(response.message);
      setSelectedBooking(null);
      document.getElementById("reject_modal").close();
      await fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject booking");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
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
        {/* Alerts */}
        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="btn btn-sm btn-ghost"
            >
              ✕
            </button>
          </div>
        )}
        {success && (
          <div className="alert alert-success mb-4">
            <span>{success}</span>
          </div>
        )}

        {/* Header */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl md:text-3xl">
              Welcome, {profile?.name || user.name}! 👋
            </h2>
            <p className="text-sm opacity-70">{profile?.email || user.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed mb-6">
          <button
            className={`tab ${activeTab === "dashboard" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`tab ${activeTab === "profile" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            My Profile
          </button>
          <button
            className={`tab ${activeTab === "properties" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("properties")}
          >
            My Properties
          </button>
          <button
            className={`tab ${activeTab === "addProperty" ? "tab-active" : ""}`}
            onClick={() => {
              setEditingProperty(null);
              setPropertyForm({
                title: "",
                description: "",
                propertyType: "room",
                address: {
                  street: "",
                  city: "",
                  state: "",
                  zipCode: "",
                  country: "USA",
                },
                googleMapsLink: "",
                rent: "",
                securityDeposit: "",
                totalRooms: "",
                availableRooms: "",
                amenities: "",
                images: "",
                availableFrom: "",
              });
              setActiveTab("addProperty");
            }}
          >
            {editingProperty ? "Edit Property" : "Add Property"}
          </button>
          <button
            className={`tab ${activeTab === "bookings" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("bookings")}
          >
            Bookings
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stat bg-base-100 shadow-xl rounded-box">
              <div className="stat-title">Total Properties</div>
              <div className="stat-value text-primary">
                {stats.totalProperties}
              </div>
              <div className="stat-desc">Listed properties</div>
            </div>
            <div className="stat bg-base-100 shadow-xl rounded-box">
              <div className="stat-title">Published</div>
              <div className="stat-value text-success">
                {stats.publishedProperties}
              </div>
              <div className="stat-desc">Live on platform</div>
            </div>
            <div className="stat bg-base-100 shadow-xl rounded-box">
              <div className="stat-title">Pending</div>
              <div className="stat-value text-warning">
                {stats.pendingProperties}
              </div>
              <div className="stat-desc">Awaiting approval</div>
            </div>
            <div className="stat bg-base-100 shadow-xl rounded-box">
              <div className="stat-title">Total Views</div>
              <div className="stat-value text-info">{stats.totalViews}</div>
              <div className="stat-desc">All properties</div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && profile && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Edit Profile</h3>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Name</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Phone</span>
                  </label>
                  <input
                    type="tel"
                    className="input input-bordered"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, phone: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Gender</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={profileForm.gender}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, gender: e.target.value })
                    }
                    required
                  >
                    <option value="">Select gender</option>
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
                    className="input input-bordered"
                    value={profileForm.occupation}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        occupation: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Bio</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-24"
                    value={profileForm.bio}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, bio: e.target.value })
                    }
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Profile"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === "properties" && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : properties.length === 0 ? (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body text-center">
                  <p>No properties listed yet. Add your first property!</p>
                  <button
                    className="btn btn-primary btn-sm mx-auto"
                    onClick={() => setActiveTab("addProperty")}
                  >
                    Add Property
                  </button>
                </div>
              </div>
            ) : (
              properties.map((property) => (
                <div
                  key={property._id}
                  className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/property/${property._id}`)}
                >
                  <div className="card-body">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="card-title">{property.title}</h3>
                        <p className="text-sm opacity-70">
                          {property.address.city}, {property.address.state}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-sm btn-info"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/property/${property._id}`);
                          }}
                        >
                          View
                        </button>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProperty(property);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProperty(property._id);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-sm opacity-70">Type</p>
                        <p className="font-semibold capitalize">
                          {property.propertyType}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm opacity-70">Rent</p>
                        <p className="font-semibold">${property.rent}/month</p>
                      </div>
                      <div>
                        <p className="text-sm opacity-70">Total Rooms</p>
                        <p className="font-semibold">{property.totalRooms}</p>
                      </div>
                      <div>
                        <p className="text-sm opacity-70">Available</p>
                        <p className="font-semibold">
                          {property.availableRooms}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm opacity-70">Status</p>
                      <div className="flex gap-2 mt-1">
                        <span
                          className={`badge ${
                            property.verificationStatus === "approved"
                              ? "badge-success"
                              : property.verificationStatus === "pending"
                              ? "badge-warning"
                              : "badge-error"
                          }`}
                        >
                          {property.verificationStatus}
                        </span>
                        {property.isPublished && (
                          <span className="badge badge-info">Published</span>
                        )}
                        <span className="badge badge-ghost">
                          Views: {property.viewCount}
                        </span>
                      </div>
                    </div>

                    {/* Current Tenants */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">
                          Current Tenants (
                          {property.currentTenants?.length || 0})
                        </h4>
                        <button
                          className="btn btn-xs btn-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAddingTenantTo(property._id);
                          }}
                        >
                          Add Tenant
                        </button>
                      </div>

                      {property.currentTenants &&
                      property.currentTenants.length > 0 ? (
                        <div className="space-y-2">
                          {property.currentTenants.map((tenant) => (
                            <div
                              key={tenant._id}
                              className="flex justify-between items-center p-2 bg-base-200 rounded"
                            >
                              <div>
                                <p className="font-semibold">{tenant.name}</p>
                                <p className="text-xs opacity-70">
                                  {tenant.gender} • {tenant.occupation}
                                </p>
                              </div>
                              <button
                                className="btn btn-xs btn-error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveTenant(property._id, tenant._id);
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm opacity-70">No tenants yet</p>
                      )}
                    </div>

                    {/* Google Maps Link */}
                    {property.googleMapsLink && (
                      <div className="mt-4">
                        <a
                          href={property.googleMapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline"
                        >
                          📍 View on Google Maps
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Add/Edit Property Tab */}
        {activeTab === "addProperty" && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">
                {editingProperty ? "Edit Property" : "Add New Property"}
              </h3>
              <form onSubmit={handlePropertySubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Title *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={propertyForm.title}
                    onChange={(e) =>
                      setPropertyForm({
                        ...propertyForm,
                        title: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Description *</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-24"
                    value={propertyForm.description}
                    onChange={(e) =>
                      setPropertyForm({
                        ...propertyForm,
                        description: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Property Type *</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={propertyForm.propertyType}
                      onChange={(e) =>
                        setPropertyForm({
                          ...propertyForm,
                          propertyType: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="room">Room</option>
                      <option value="flat">Flat</option>
                      <option value="apartment">Apartment</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">City *</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={propertyForm.address.city}
                      onChange={(e) =>
                        setPropertyForm({
                          ...propertyForm,
                          address: {
                            ...propertyForm.address,
                            city: e.target.value,
                          },
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Street</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={propertyForm.address.street}
                      onChange={(e) =>
                        setPropertyForm({
                          ...propertyForm,
                          address: {
                            ...propertyForm.address,
                            street: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">State</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={propertyForm.address.state}
                      onChange={(e) =>
                        setPropertyForm({
                          ...propertyForm,
                          address: {
                            ...propertyForm.address,
                            state: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Zip Code</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={propertyForm.address.zipCode}
                      onChange={(e) =>
                        setPropertyForm({
                          ...propertyForm,
                          address: {
                            ...propertyForm.address,
                            zipCode: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Google Maps Link</span>
                  </label>
                  <input
                    type="url"
                    className="input input-bordered"
                    value={propertyForm.googleMapsLink}
                    onChange={(e) =>
                      setPropertyForm({
                        ...propertyForm,
                        googleMapsLink: e.target.value,
                      })
                    }
                    placeholder="Paste Google Maps link here (e.g., https://goo.gl/maps/...)"
                  />
                  <label className="label">
                    <span className="label-text-alt">
                      Right-click on Google Maps location → Share → Copy link
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Monthly Rent ($) *</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered"
                      value={propertyForm.rent}
                      onChange={(e) =>
                        setPropertyForm({
                          ...propertyForm,
                          rent: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Security Deposit ($)</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered"
                      value={propertyForm.securityDeposit}
                      onChange={(e) =>
                        setPropertyForm({
                          ...propertyForm,
                          securityDeposit: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Total Rooms *</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered"
                      value={propertyForm.totalRooms}
                      onChange={(e) =>
                        setPropertyForm({
                          ...propertyForm,
                          totalRooms: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Available Rooms *</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered"
                      value={propertyForm.availableRooms}
                      onChange={(e) =>
                        setPropertyForm({
                          ...propertyForm,
                          availableRooms: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">
                      Amenities (comma-separated)
                    </span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={propertyForm.amenities}
                    onChange={(e) =>
                      setPropertyForm({
                        ...propertyForm,
                        amenities: e.target.value,
                      })
                    }
                    placeholder="WiFi, Parking, AC, etc."
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">
                      Image URLs (comma-separated)
                    </span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={propertyForm.images}
                    onChange={(e) =>
                      setPropertyForm({
                        ...propertyForm,
                        images: e.target.value,
                      })
                    }
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Available From</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered"
                    value={propertyForm.availableFrom}
                    onChange={(e) =>
                      setPropertyForm({
                        ...propertyForm,
                        availableFrom: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading
                      ? "Saving..."
                      : editingProperty
                      ? "Update Property"
                      : "Create Property"}
                  </button>
                  {editingProperty && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => {
                        setEditingProperty(null);
                        setActiveTab("properties");
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Bookings Tab */}
      {activeTab === "bookings" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Booking Requests</h2>
          </div>

          {/* Filter tabs */}
          <div className="tabs tabs-boxed">
            <button
              className={`tab ${bookingFilter === "all" ? "tab-active" : ""}`}
              onClick={() => setBookingFilter("all")}
            >
              All
            </button>
            <button
              className={`tab ${
                bookingFilter === "pending" ? "tab-active" : ""
              }`}
              onClick={() => setBookingFilter("pending")}
            >
              Pending
            </button>
            <button
              className={`tab ${
                bookingFilter === "approved" ? "tab-active" : ""
              }`}
              onClick={() => setBookingFilter("approved")}
            >
              Approved
            </button>
            <button
              className={`tab ${
                bookingFilter === "active" ? "tab-active" : ""
              }`}
              onClick={() => setBookingFilter("active")}
            >
              Active
            </button>
            <button
              className={`tab ${
                bookingFilter === "rejected" ? "tab-active" : ""
              }`}
              onClick={() => setBookingFilter("rejected")}
            >
              Rejected
            </button>
            <button
              className={`tab ${
                bookingFilter === "cancelled" ? "tab-active" : ""
              }`}
              onClick={() => setBookingFilter("cancelled")}
            >
              Cancelled
            </button>
            <button
              className={`tab ${
                bookingFilter === "completed" ? "tab-active" : ""
              }`}
              onClick={() => setBookingFilter("completed")}
            >
              Completed
            </button>
          </div>

          {/* Bookings List */}
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="alert">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="stroke-info shrink-0 w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span>No bookings found</span>
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking._id} className="card bg-base-200 shadow-xl">
                  <div className="card-body">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="card-title">
                          {booking.property?.title || "Property"}
                        </h3>
                        <div className="flex items-center gap-2">
                          <p className="text-sm opacity-70">
                            Tenant: {booking.tenant?.name || "Unknown"}
                          </p>
                          {booking.tenant?._id && (
                            <button
                              onClick={() =>
                                navigate(`/user/${booking.tenant._id}`)
                              }
                              className="btn btn-xs btn-ghost"
                            >
                              View Profile
                            </button>
                          )}
                        </div>
                        <p className="text-sm opacity-70">
                          Email: {booking.tenant?.email || "N/A"}
                        </p>
                      </div>
                      <div
                        className={`badge ${getStatusBadge(booking.status)}`}
                      >
                        {booking.status}
                      </div>
                    </div>

                    <div className="divider"></div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold">Type</p>
                        <p className="text-sm opacity-70">
                          {booking.bookingType === "visit"
                            ? "Property Visit"
                            : "Room Booking"}
                        </p>
                      </div>

                      {booking.bookingType === "visit" && (
                        <>
                          <div>
                            <p className="text-sm font-semibold">
                              Proposed Date
                            </p>
                            <p className="text-sm opacity-70">
                              {new Date(
                                booking.proposedDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          {booking.approvedVisitTime && (
                            <div>
                              <p className="text-sm font-semibold">
                                Approved Time
                              </p>
                              <p className="text-sm opacity-70">
                                {booking.approvedVisitTime}
                              </p>
                            </div>
                          )}
                        </>
                      )}

                      {booking.bookingType === "booking" && (
                        <>
                          <div>
                            <p className="text-sm font-semibold">
                              Move-in Date
                            </p>
                            <p className="text-sm opacity-70">
                              {new Date(
                                booking.moveInDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold">
                              Lease Duration
                            </p>
                            <p className="text-sm opacity-70">
                              {booking.leaseDuration} months
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {booking.tenantNotes && (
                      <div>
                        <p className="text-sm font-semibold">Tenant Notes</p>
                        <p className="text-sm opacity-70">
                          {booking.tenantNotes}
                        </p>
                      </div>
                    )}

                    {booking.status === "pending" && (
                      <div className="card-actions justify-end mt-4">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => {
                            setSelectedBooking(booking);
                            document.getElementById("accept_modal").showModal();
                          }}
                        >
                          Accept
                        </button>
                        <button
                          className="btn btn-error btn-sm"
                          onClick={() => {
                            setSelectedBooking(booking);
                            document.getElementById("reject_modal").showModal();
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    <div className="text-xs opacity-50 mt-2">
                      Created: {new Date(booking.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Accept Booking Modal */}
      <dialog id="accept_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg mb-4">Accept Booking Request</h3>

          {selectedBooking && (
            <div className="space-y-4">
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
                  {selectedBooking.bookingType === "visit"
                    ? "Accepting a visit request allows the tenant to visit your property."
                    : "Accepting a booking request will add the tenant to your property."}
                </span>
              </div>

              {selectedBooking.bookingType === "visit" && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">
                      Approved Visit Time (9 AM - 5 PM) *
                    </span>
                  </label>
                  <input
                    type="time"
                    className="input input-bordered"
                    value={approvedVisitTime}
                    onChange={(e) => setApprovedVisitTime(e.target.value)}
                    min="09:00"
                    max="17:00"
                    required
                  />
                  <label className="label">
                    <span className="label-text-alt">
                      Select a time between 9:00 AM and 5:00 PM
                    </span>
                  </label>
                </div>
              )}

              {error && (
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
              )}

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleAcceptBooking(selectedBooking)}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Confirm Accept"}
                </button>
                <form method="dialog">
                  <button className="btn">Cancel</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </dialog>

      {/* Reject Booking Modal */}
      <dialog id="reject_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg mb-4">Reject Booking Request</h3>

          {selectedBooking && (
            <div className="space-y-4">
              <div className="alert alert-warning">
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>
                  Are you sure you want to reject this booking request?
                </span>
              </div>

              {error && (
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
              )}

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-error"
                  onClick={() => handleRejectBooking(selectedBooking._id)}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Confirm Reject"}
                </button>
                <form method="dialog">
                  <button className="btn">Cancel</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </dialog>

      {/* Add Tenant Modal */}
      {addingTenantTo && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Add Current Tenant</h3>
            <form onSubmit={handleAddTenant} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Tenant Name *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={tenantForm.name}
                  onChange={(e) =>
                    setTenantForm({ ...tenantForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Gender *</span>
                </label>
                <select
                  className="select select-bordered"
                  value={tenantForm.gender}
                  onChange={(e) =>
                    setTenantForm({ ...tenantForm, gender: e.target.value })
                  }
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Occupation *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={tenantForm.occupation}
                  onChange={(e) =>
                    setTenantForm({ ...tenantForm, occupation: e.target.value })
                  }
                  required
                />
              </div>

              <div className="modal-action">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Tenant"}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setAddingTenantTo(null);
                    setTenantForm({ name: "", gender: "", occupation: "" });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setAddingTenantTo(null)}
          ></div>
        </div>
      )}
    </div>
  );
};

export default LandlordProfilePage;
