import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../lib/axios";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "tenant",
    phone: "",
    gender: "",
    occupation: "",
    dateOfBirth: "",
    bio: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!formData.phone) {
      setError("Phone number is required");
      return;
    }

    if (!formData.gender) {
      setError("Please select your gender");
      return;
    }

    setLoading(true);

    try {
      // Remove confirmPassword before sending to backend
      // eslint-disable-next-line no-unused-vars
      const { confirmPassword, ...registerData } = formData;

      console.log("Sending registration data:", registerData);
      const { data } = await api.post("/authentication/register", registerData);
      console.log("Registration response:", data);

      
      // For OTP
      if (data.requiresOTP) {
        // Store user data in sessionStorage for OTP verification
        sessionStorage.setItem("registrationData", JSON.stringify(registerData));
        sessionStorage.setItem("registrationEmail", data.email);
        
        // Show success message
        setSuccess("OTP sent to your email! Redirecting to verification...");
        
        // Redirect to OTP page
        setTimeout(() => {
          navigate("/verify-otp");
        }, 1500);
      }
    } catch (err) {
      console.error("Registration error:", err);
      console.error("Error response:", err.response);
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 py-8">
      <div className="card w-full max-w-2xl bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold justify-center mb-4">
            Create Account
          </h2>

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection - First */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  I want to register as *
                </span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="select select-bordered"
                required
              >
                <option value="tenant">Tenant (Looking for rooms)</option>
                <option value="landlord">Landlord (I have properties)</option>
              </select>
            </div>

            {/* Basic Information */}
            <div className="divider">Basic Information</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Full Name *</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="input input-bordered"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Phone Number *</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="01234567890"
                  className="input input-bordered"
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Email *</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@gmail.com"
                className="input input-bordered"
                required
              />
            </div>

            {/* Personal Information */}
            <div className="divider">Personal Information</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Gender *</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
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
                  <span className="label-text">Date of Birth</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="input input-bordered"
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Occupation</span>
              </label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                placeholder="e.g., Student, Engineer, Teacher, Businessman"
                className="input input-bordered"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Bio (Optional)</span>
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us a bit about yourself..."
                className="textarea textarea-bordered h-24"
                maxLength={500}
              />
              <label className="label">
                <span className="label-text-alt">
                  {formData.bio.length}/500 characters
                </span>
              </label>
            </div>

            {/* Security */}
            <div className="divider">Security</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password *</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input input-bordered"
                  required
                  minLength={6}
                />
                <label className="label">
                  <span className="label-text-alt">At least 6 characters</span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Confirm Password *</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input input-bordered"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full mt-6"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-4">
            Already have an account?{" "}
            <Link to="/login" className="link link-primary">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
