import { useEffect, useState } from "react";
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

const LandlordProfilePage = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, profile, properties, addProperty
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
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
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

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
  }, [navigate]);

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
        amenities: propertyForm.amenities.split(",").map(a => a.trim()).filter(a => a),
        images: propertyForm.images.split(",").map(i => i.trim()).filter(i => i),
        googleMapsLink: propertyForm.googleMapsLink || "",
      };

      if (editingProperty) {
        await updateProperty(editingProperty._id, propertyData);
        setSuccess("Property updated successfully!");
      } else {
        await createProperty(propertyData);
        setSuccess("Property created successfully!");
      }
      
      // Reset form and refresh
      setPropertyForm({
        title: "",
        description: "",
        propertyType: "room",
        address: { street: "", city: "", state: "", zipCode: "", country: "USA" },
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
      availableFrom: property.availableFrom ? new Date(property.availableFrom).toISOString().split('T')[0] : "",
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
            <button onClick={() => setError("")} className="btn btn-sm btn-ghost">✕</button>
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
                address: { street: "", city: "", state: "", zipCode: "", country: "USA" },
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
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stat bg-base-100 shadow-xl rounded-box">
              <div className="stat-title">Total Properties</div>
              <div className="stat-value text-primary">{stats.totalProperties}</div>
              <div className="stat-desc">Listed properties</div>
            </div>
            <div className="stat bg-base-100 shadow-xl rounded-box">
              <div className="stat-title">Published</div>
              <div className="stat-value text-success">{stats.publishedProperties}</div>
              <div className="stat-desc">Live on platform</div>
            </div>
            <div className="stat bg-base-100 shadow-xl rounded-box">
              <div className="stat-title">Pending</div>
              <div className="stat-value text-warning">{stats.pendingProperties}</div>
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
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
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
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
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
                    onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
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
                    onChange={(e) => setProfileForm({ ...profileForm, occupation: e.target.value })}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Bio</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-24"
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
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
                <div key={property._id} className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="card-title">{property.title}</h3>
                        <p className="text-sm opacity-70">{property.address.city}, {property.address.state}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleEditProperty(property)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-error"
                          onClick={() => handleDeleteProperty(property._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-sm opacity-70">Type</p>
                        <p className="font-semibold capitalize">{property.propertyType}</p>
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
                        <p className="font-semibold">{property.availableRooms}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm opacity-70">Status</p>
                      <div className="flex gap-2 mt-1">
                        <span className={`badge ${
                          property.verificationStatus === "approved" ? "badge-success" :
                          property.verificationStatus === "pending" ? "badge-warning" :
                          "badge-error"
                        }`}>
                          {property.verificationStatus}
                        </span>
                        {property.isPublished && (
                          <span className="badge badge-info">Published</span>
                        )}
                        <span className="badge badge-ghost">Views: {property.viewCount}</span>
                      </div>
                    </div>

                    {/* Current Tenants */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">Current Tenants ({property.currentTenants?.length || 0})</h4>
                        <button
                          className="btn btn-xs btn-primary"
                          onClick={() => setAddingTenantTo(property._id)}
                        >
                          Add Tenant
                        </button>
                      </div>
                      
                      {property.currentTenants && property.currentTenants.length > 0 ? (
                        <div className="space-y-2">
                          {property.currentTenants.map((tenant) => (
                            <div key={tenant._id} className="flex justify-between items-center p-2 bg-base-200 rounded">
                              <div>
                                <p className="font-semibold">{tenant.name}</p>
                                <p className="text-xs opacity-70">
                                  {tenant.gender} • {tenant.occupation}
                                </p>
                              </div>
                              <button
                                className="btn btn-xs btn-error"
                                onClick={() => handleRemoveTenant(property._id, tenant._id)}
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
                    onChange={(e) => setPropertyForm({ ...propertyForm, title: e.target.value })}
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
                    onChange={(e) => setPropertyForm({ ...propertyForm, description: e.target.value })}
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
                      onChange={(e) => setPropertyForm({ ...propertyForm, propertyType: e.target.value })}
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
                          address: { ...propertyForm.address, city: e.target.value },
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
                          address: { ...propertyForm.address, street: e.target.value },
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
                          address: { ...propertyForm.address, state: e.target.value },
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
                          address: { ...propertyForm.address, zipCode: e.target.value },
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
                    <span className="label-text-alt">Right-click on Google Maps location → Share → Copy link</span>
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
                      onChange={(e) => setPropertyForm({ ...propertyForm, rent: e.target.value })}
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
                      onChange={(e) => setPropertyForm({ ...propertyForm, securityDeposit: e.target.value })}
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
                      onChange={(e) => setPropertyForm({ ...propertyForm, totalRooms: e.target.value })}
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
                      onChange={(e) => setPropertyForm({ ...propertyForm, availableRooms: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Amenities (comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={propertyForm.amenities}
                    onChange={(e) => setPropertyForm({ ...propertyForm, amenities: e.target.value })}
                    placeholder="WiFi, Parking, AC, etc."
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Image URLs (comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={propertyForm.images}
                    onChange={(e) => setPropertyForm({ ...propertyForm, images: e.target.value })}
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
                    onChange={(e) => setPropertyForm({ ...propertyForm, availableFrom: e.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Saving..." : editingProperty ? "Update Property" : "Create Property"}
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
                  onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })}
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
                  onChange={(e) => setTenantForm({ ...tenantForm, gender: e.target.value })}
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
                  onChange={(e) => setTenantForm({ ...tenantForm, occupation: e.target.value })}
                  required
                />
              </div>

              <div className="modal-action">
                <button type="submit" className="btn btn-primary" disabled={loading}>
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
          <div className="modal-backdrop" onClick={() => setAddingTenantTo(null)}></div>
        </div>
      )}
    </div>
  );
};

export default LandlordProfilePage;
