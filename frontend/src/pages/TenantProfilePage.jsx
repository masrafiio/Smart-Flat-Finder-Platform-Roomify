import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";

const TenantProfilePage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token) {
      navigate("/login");
    } else {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "tenant") {
        navigate("/");
      } else {
        setUser(parsedUser);
      }
    }
  }, [navigate]);

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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-base-200">
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

      <div className="container mx-auto p-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-3xl">
              My Profile - {user.name}! 👋
            </h2>
            <div className="divider"></div>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Email:</span> {user.email}
              </p>
              <p>
                <span className="font-semibold">Role:</span>{" "}
                <span className="badge badge-primary badge-lg capitalize">
                  {user.role}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">My Bookings</h2>
              <p>View your current bookings</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary btn-sm">View</button>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Favorites</h2>
              <p>Your saved properties</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary btn-sm">View</button>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Messages</h2>
              <p>Check your messages</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary btn-sm">Open</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantProfilePage;
