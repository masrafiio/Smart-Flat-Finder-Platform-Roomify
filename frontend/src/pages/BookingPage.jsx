import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  createBookingRequest,
  getMyBookings,
  getMyCurrentProperty,
  cancelBooking,
  leaveProperty,
} from "../api/bookingApi";

const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const propertyFromState = location.state?.property;

  const [activeTab, setActiveTab] = useState("create");
  const [bookings, setBookings] = useState([]);
  const [currentProperty, setCurrentProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [bookingType, setBookingType] = useState("visit");
  const [selectedProperty, _setSelectedProperty] = useState(
    propertyFromState?._id || ""
  );
  const [proposedDate, setProposedDate] = useState("");
  const [moveInDate, setMoveInDate] = useState("");

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchData = async () => {
    if (activeTab === "myBookings") {
      await fetchMyBookings();
      await fetchCurrentProperty();
    }
  };

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const data = await getMyBookings();
      setBookings(data.bookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!selectedProperty && !propertyFromState) {
      setError("Please select a property");
      return;
    }

    const propertyId = selectedProperty || propertyFromState._id;

    try {
      setLoading(true);

      const bookingData = {
        propertyId,
        bookingType,
      };

      if (bookingType === "visit") {
        if (!proposedDate) {
          setError("Please select date for visit");
          return;
        }
        bookingData.proposedDate = proposedDate;
      } else {
        if (!moveInDate) {
          setError("Please provide move-in date");
          return;
        }
        bookingData.moveInDate = moveInDate;
      }

      const response = await createBookingRequest(bookingData);
      setSuccess(response.message);

      // Reset form
      setProposedDate("");
      setMoveInDate("");

      // Switch to bookings tab
      setTimeout(() => {
        setActiveTab("myBookings");
        fetchMyBookings();
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create booking request"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await cancelBooking(bookingId);
      setSuccess(response.message);
      await fetchMyBookings();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel booking");
    } finally {
      setLoading(false);
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
      setLoading(true);
      const response = await leaveProperty();
      setSuccess(response.message);
      await fetchCurrentProperty();
      await fetchMyBookings();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to leave property");
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

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <Navbar />

      <div className="flex-grow container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Property Bookings</h1>

        {/* Tabs */}
        <div className="tabs tabs-boxed mb-6">
          <a
            className={`tab ${activeTab === "create" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("create")}
          >
            Create Booking
          </a>
          <a
            className={`tab ${activeTab === "myBookings" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("myBookings")}
          >
            My Bookings
          </a>
        </div>

        {/* Alerts */}
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

        {/* Create Booking Tab */}
        {activeTab === "create" && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                {propertyFromState
                  ? `Request for: ${propertyFromState.title}`
                  : "Create Booking Request"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Booking Type */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Request Type
                    </span>
                  </label>
                  <div className="flex gap-4">
                    <label className="label cursor-pointer gap-2">
                      <input
                        type="radio"
                        name="bookingType"
                        className="radio radio-primary"
                        value="visit"
                        checked={bookingType === "visit"}
                        onChange={(e) => setBookingType(e.target.value)}
                      />
                      <span className="label-text">Property Visit</span>
                    </label>
                    <label className="label cursor-pointer gap-2">
                      <input
                        type="radio"
                        name="bookingType"
                        className="radio radio-primary"
                        value="booking"
                        checked={bookingType === "booking"}
                        onChange={(e) => setBookingType(e.target.value)}
                      />
                      <span className="label-text">Room Booking</span>
                    </label>
                  </div>
                </div>

                {/* Visit Type Fields */}
                {bookingType === "visit" && (
                  <>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Proposed Date</span>
                      </label>
                      <input
                        type="date"
                        value={proposedDate}
                        onChange={(e) => setProposedDate(e.target.value)}
                        className="input input-bordered"
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                  </>
                )}

                {/* Booking Type Fields */}
                {bookingType === "booking" && (
                  <>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Move-in Date</span>
                      </label>
                      <input
                        type="date"
                        value={moveInDate}
                        onChange={(e) => setMoveInDate(e.target.value)}
                        className="input input-bordered"
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                  </>
                )}

                <div className="card-actions justify-end">
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      "Submit Request"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* My Bookings Tab */}
        {activeTab === "myBookings" && (
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
                        <span className="font-semibold">Rent:</span> ৳
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
                        disabled={loading}
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

                {loading ? (
                  <div className="flex justify-center py-8">
                    <span className="loading loading-spinner loading-lg"></span>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-8 opacity-50">
                    <p>No bookings yet</p>
                    <button
                      onClick={() => setActiveTab("create")}
                      className="btn btn-primary btn-sm mt-4"
                    >
                      Create Your First Booking
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
                                  className={`badge ${getStatusBadge(
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
                                {booking.property.address.city} • ৳
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
                                disabled={loading}
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
      </div>

      <Footer />
    </div>
  );
};

export default BookingPage;
