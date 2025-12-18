import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";

const HomePage = () => {
  const [user, setUser] = useState(null);
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

      setUser(parsedUser);
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

  const goToProfile = () => {
    if (user?.role === "tenant") {
      navigate("/tenant-profile");
    } else if (user?.role === "landlord") {
      navigate("/landlord-profile");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-lg">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">🏠 Roomify</a>
        </div>
        <div className="flex-none gap-2">
          <button onClick={goToProfile} className="btn btn-primary">
            My Profile
          </button>
          <button onClick={handleLogout} className="btn btn-error">
            Logout
          </button>
        </div>
      </div>

      <div className="hero min-h-[80vh] bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Welcome to Roomify! 🏠</h1>
            <p className="py-6">
              Find your perfect room or list your property. Connect with
              thousands of renters and property owners.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="btn btn-primary">Browse Properties</button>
              <button className="btn btn-outline">Learn More</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
