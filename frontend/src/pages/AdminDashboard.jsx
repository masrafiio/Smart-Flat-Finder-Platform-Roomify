import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";
import Navbar from "../components/Navbar";

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    bio: "",
    profilePicture: "",
  });
  const navigate = useNavigate();

  const fetchDashboardStats = async () => {
    try {
      const { data } = await api.get("/admin/dashboard/stats");
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const checkAuth = useCallback(() => {
    const userData = localStorage.getItem("user");
    if (!userData) return;

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setProfileData({
      name: parsedUser.name || "",
      phone: parsedUser.phone || "",
      bio: parsedUser.bio || "",
      profilePicture: parsedUser.profilePicture || "",
    });
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data.users);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/properties");
      setProperties(data.properties);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingVerifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/properties/pending");
      setProperties(data.properties);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/reports");
      setReports(data.reports);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (userId) => {
    if (!confirm("Suspend this user?")) return;

    try {
      await api.put(`/admin/users/${userId}/suspend`);
      alert("User suspended");
      fetchUsers();
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || "Failed"));
    }
  };

  const handleUnsuspendUser = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/unsuspend`);
      alert("User unsuspended");
      fetchUsers();
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || "Failed"));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("DELETE this user? Cannot be undone!")) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      alert("User deleted");
      fetchUsers();
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || "Failed"));
    }
  };

  const handleApproveProperty = async (propertyId) => {
    try {
      await api.put(`/admin/properties/${propertyId}/approve`);
      alert("Property approved");
      fetchPendingVerifications();
      fetchDashboardStats();
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || "Failed"));
    }
  };

  const handleRejectProperty = async (propertyId) => {
    const rejectionReason = prompt("Rejection reason:");
    if (!rejectionReason) return;

    try {
      await api.put(`/admin/properties/${propertyId}/reject`, {
        rejectionReason,
      });
      alert("Property rejected");
      fetchPendingVerifications();
      fetchDashboardStats();
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || "Failed"));
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!confirm("DELETE this property?")) return;

    try {
      await api.delete(`/admin/properties/${propertyId}`);
      alert("Property deleted");
      fetchProperties();
      fetchDashboardStats();
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || "Failed"));
    }
  };

  const handleSuspendProperty = async (propertyId) => {
    if (!confirm("Suspend this property?")) return;

    try {
      await api.put(`/admin/properties/${propertyId}/suspend`);
      alert("Property suspended");
      fetchProperties();
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || "Failed"));
    }
  };

  const handleUnsuspendProperty = async (propertyId) => {
    try {
      await api.put(`/admin/properties/${propertyId}/unsuspend`);
      alert("Property unsuspended");
      fetchProperties();
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || "Failed"));
    }
  };

  const handleUpdateReport = async (reportId, status) => {
    try {
      await api.put(`/admin/reports/${reportId}`, {
        status,
      });
      alert("Report updated");
      fetchReports();
      fetchDashboardStats();
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || "Failed"));
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!confirm("Delete this report? Cannot be undone!")) return;

    try {
      await api.delete(`/admin/reports/${reportId}`);
      alert("Report deleted");
      fetchReports();
      fetchDashboardStats();
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || "Failed"));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.put("/admin/profile", profileData);
      const updatedUser = { ...user, ...data.user };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      alert("Profile updated!");
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || "Failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "users") fetchUsers();
    if (tab === "properties") fetchProperties();
    if (tab === "pending") fetchPendingVerifications();
    if (tab === "reports") fetchReports();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <div className="container mx-auto p-8">
        {/* Tabs */}
        <div className="tabs tabs-boxed mb-6">
          <a
            className={`tab ${activeTab === "overview" ? "tab-active" : ""}`}
            onClick={() => handleTabChange("overview")}
          >
            Overview
          </a>
          <a
            className={`tab ${activeTab === "profile" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </a>
          <a
            className={`tab ${activeTab === "users" ? "tab-active" : ""}`}
            onClick={() => handleTabChange("users")}
          >
            Users
          </a>
          <a
            className={`tab ${activeTab === "properties" ? "tab-active" : ""}`}
            onClick={() => handleTabChange("properties")}
          >
            Properties
          </a>
          <a
            className={`tab ${activeTab === "pending" ? "tab-active" : ""}`}
            onClick={() => handleTabChange("pending")}
          >
            Pending ({stats?.pendingVerifications || 0})
          </a>
          <a
            className={`tab ${activeTab === "reports" ? "tab-active" : ""}`}
            onClick={() => handleTabChange("reports")}
          >
            Reports ({stats?.pendingReports || 0})
          </a>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && stats && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Total Users</div>
                  <div className="stat-value text-primary">
                    {stats.totalUsers}
                  </div>
                  <div className="stat-desc">
                    {stats.totalLandlords} landlords, {stats.totalTenants}{" "}
                    tenants
                  </div>
                </div>
              </div>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Total Properties</div>
                  <div className="stat-value text-secondary">
                    {stats.totalProperties}
                  </div>
                  <div className="stat-desc">
                    {stats.pendingVerifications} pending
                  </div>
                </div>
              </div>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Pending Reports</div>
                  <div className="stat-value text-accent">
                    {stats.pendingReports}
                  </div>
                  <div className="stat-desc">Requires attention</div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-2xl font-bold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => handleTabChange("users")}
                >
                  Manage Users
                </button>
                <button
                  className="btn btn-secondary btn-lg"
                  onClick={() => handleTabChange("properties")}
                >
                  Manage Properties
                </button>
                <button
                  className="btn btn-accent btn-lg"
                  onClick={() => handleTabChange("pending")}
                >
                  Review Pending
                </button>
                <button
                  className="btn btn-warning btn-lg"
                  onClick={() => handleTabChange("reports")}
                >
                  Handle Reports
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="max-w-2xl mx-auto">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-3xl mb-4">Admin Profile</h2>
                <form onSubmit={handleProfileSubmit}>
                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Name</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      className="input input-bordered"
                      required
                    />
                  </div>

                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      className="input input-bordered"
                      disabled
                    />
                    <label className="label">
                      <span className="label-text-alt">Cannot be changed</span>
                    </label>
                  </div>

                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Phone</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          phone: e.target.value,
                        })
                      }
                      className="input input-bordered"
                    />
                  </div>

                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Bio</span>
                    </label>
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData({ ...profileData, bio: e.target.value })
                      }
                      className="textarea textarea-bordered h-24"
                      placeholder="About you..."
                    />
                  </div>

                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Profile Picture URL</span>
                    </label>
                    <input
                      type="url"
                      name="profilePicture"
                      value={profileData.profilePicture}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          profilePicture: e.target.value,
                        })
                      }
                      className="input input-bordered"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="card-actions justify-end mt-6">
                    <button
                      type="submit"
                      className={`btn btn-primary ${loading ? "loading" : ""}`}
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Update Profile"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            <h2 className="text-3xl font-bold mb-6">User Management</h2>
            {loading ? (
              <div className="flex justify-center p-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <span
                            className={`badge ${
                              u.role === "admin"
                                ? "badge-error"
                                : u.role === "landlord"
                                ? "badge-warning"
                                : "badge-info"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td>{u.phone || "N/A"}</td>
                        <td>
                          {u.isSuspended ? (
                            <span className="badge badge-error">Suspended</span>
                          ) : (
                            <span className="badge badge-success">Active</span>
                          )}
                        </td>
                        <td>
                          <div className="flex gap-2">
                            {u.isSuspended ? (
                              <button
                                className="btn btn-success btn-xs"
                                onClick={() => handleUnsuspendUser(u._id)}
                              >
                                Unsuspend
                              </button>
                            ) : (
                              <button
                                className="btn btn-warning btn-xs"
                                onClick={() => handleSuspendUser(u._id)}
                              >
                                Suspend
                              </button>
                            )}
                            <button
                              className="btn btn-error btn-xs"
                              onClick={() => handleDeleteUser(u._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === "properties" && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Property Management</h2>
            {loading ? (
              <div className="flex justify-center p-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Landlord</th>
                      <th>Type</th>
                      <th>Rent</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((prop) => (
                      <tr key={prop._id}>
                        <td>{prop.title}</td>
                        <td>{prop.landlord?.name || "Unknown"}</td>
                        <td className="capitalize">{prop.propertyType}</td>
                        <td>${prop.rent}</td>
                        <td>
                          <span
                            className={`badge ${
                              prop.verificationStatus === "approved"
                                ? "badge-success"
                                : prop.verificationStatus === "rejected"
                                ? "badge-error"
                                : "badge-warning"
                            }`}
                          >
                            {prop.verificationStatus}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-1">
                            {prop.isSuspended ? (
                              <button
                                className="btn btn-success btn-xs"
                                onClick={() => handleUnsuspendProperty(prop._id)}
                              >
                                Unsuspend
                              </button>
                            ) : (
                              <button
                                className="btn btn-warning btn-xs"
                                onClick={() => handleSuspendProperty(prop._id)}
                              >
                                Suspend
                              </button>
                            )}
                            <button
                              className="btn btn-error btn-xs"
                              onClick={() => handleDeleteProperty(prop._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Pending Tab */}
        {activeTab === "pending" && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Pending Verifications</h2>
            {loading ? (
              <div className="flex justify-center p-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center p-8">
                <p className="text-xl">No pending verifications</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {properties.map((prop) => (
                  <div key={prop._id} className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                      <h2 className="card-title">{prop.title}</h2>
                      <p className="text-sm text-gray-600">
                        Landlord: {prop.landlord?.name} ({prop.landlord?.email})
                      </p>
                      <p>{prop.description.substring(0, 100)}...</p>
                      <div className="flex gap-2">
                        <span className="badge capitalize">
                          {prop.propertyType}
                        </span>
                        <span className="badge badge-primary">
                          ${prop.rent}/month
                        </span>
                      </div>
                      <p className="text-sm">
                        {prop.address.city}, {prop.address.state}
                      </p>
                      <div className="card-actions justify-end mt-4">
                        <button
                          className="btn btn-info btn-sm"
                          onClick={() => navigate(`/property/${prop._id}`)}
                        >
                          View Details
                        </button>
                        <button
                          className="btn btn-error btn-sm"
                          onClick={() => handleRejectProperty(prop._id)}
                        >
                          Reject
                        </button>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleApproveProperty(prop._id)}
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Report Management</h2>
            {loading ? (
              <div className="flex justify-center p-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Reporter</th>
                      <th>Reported User</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No reports found
                        </td>
                      </tr>
                    ) : (
                      reports.map((report) => (
                        <tr key={report._id}>
                          <td>#{report._id.slice(-6)}</td>
                          <td>
                            {report.reporter?.name || "Unknown"}
                            <br />
                            <span className="text-xs opacity-60">
                              {report.reporter?.role}
                            </span>
                          </td>
                          <td>
                            {report.reportedItemDetails?.name || "Unknown"}
                            <br />
                            <span className="text-xs opacity-60">
                              {report.reportedItemDetails?.role}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                report.status === "resolved"
                                  ? "badge-success"
                                  : report.status === "dismissed"
                                  ? "badge-error"
                                  : "badge-warning"
                              }`}
                            >
                              {report.status}
                            </span>
                          </td>
                          <td>
                            {new Date(report.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() =>
                                document
                                  .getElementById(`report_modal_${report._id}`)
                                  .showModal()
                              }
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Report Modals */}
                {reports.map((report) => (
                  <dialog
                    key={report._id}
                    id={`report_modal_${report._id}`}
                    className="modal"
                  >
                    <div className="modal-box">
                      <h3 className="font-bold text-lg mb-4">
                        Report Details
                      </h3>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold">Reporter:</p>
                          <p>
                            {report.reporter?.name} ({report.reporter?.email})
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-semibold">
                            Reported User:
                          </p>
                          <p>
                            {report.reportedItemDetails?.name || "Unknown"} (
                            {report.reportedItemDetails?.email || "N/A"})
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-semibold">Comment:</p>
                          <div className="bg-base-200 p-3 rounded mt-1">
                            <p className="whitespace-pre-wrap">
                              {report.description || "No comment provided"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-semibold">Status:</p>
                          <p className="capitalize">{report.status}</p>
                        </div>

                        <div>
                          <p className="text-sm font-semibold">Date:</p>
                          <p>{new Date(report.createdAt).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="modal-action">
                        <div className="flex gap-2 w-full">
                          {report.status !== "resolved" && (
                            <button
                              className="btn btn-success flex-1"
                              onClick={() => {
                                handleUpdateReport(report._id, "resolved");
                                document
                                  .getElementById(`report_modal_${report._id}`)
                                  .close();
                              }}
                            >
                              Mark as Reviewed
                            </button>
                          )}

                          <button
                            className="btn btn-warning flex-1"
                            onClick={() => {
                              handleDeleteReport(report._id);
                              document
                                .getElementById(`report_modal_${report._id}`)
                                .close();
                            }}
                          >
                            Remove Report
                          </button>

                          <form method="dialog">
                            <button className="btn">Close</button>
                          </form>
                        </div>
                      </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                      <button>close</button>
                    </form>
                  </dialog>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
