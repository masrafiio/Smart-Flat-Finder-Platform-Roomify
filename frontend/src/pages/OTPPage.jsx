import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../lib/axios";

const OTPPage = () => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Get email from sessionStorage
    const storedEmail = sessionStorage.getItem("registrationEmail");
    const userData = sessionStorage.getItem("registrationData");

    if (!storedEmail || !userData) {
      setError("Registration data not found. Please register again.");
      setTimeout(() => navigate("/register"), 2000);
      return;
    }

    setEmail(storedEmail);

    // Start countdown timer
    setCountdown(60);
  }, [navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOTPChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    if (value.length <= 6) {
      setOtp(value);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const userData = JSON.parse(sessionStorage.getItem("registrationData"));
      
      const { data } = await api.post("/authentication/verify-otp", {
        email,
        otp,
        userData,
      });

      console.log("OTP verification response:", data);

      // Save token and user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Clear session storage
      sessionStorage.removeItem("registrationData");
      sessionStorage.removeItem("registrationEmail");

      setSuccess("Registration successful! Redirecting...");

      setTimeout(() => {
        // Redirect based on user role
        if (data.user.role === "landlord") {
          navigate("/landlord-profile");
        } else if (data.user.role === "tenant") {
          navigate("/tenant-profile");
        } else {
          navigate("/");
        }
      }, 1500);
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setError("");
    setSuccess("");
    setResendLoading(true);

    try {
      await api.post("/authentication/resend-otp", { email });
      setSuccess("New OTP sent to your email!");
      setCountdown(60);
      setOtp("");
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 py-8">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold justify-center mb-2">
            Verify Your Email
          </h2>
          <p className="text-center text-sm text-gray-600 mb-6">
            We&apos;ve sent a 6-digit code to
            <br />
            <span className="font-semibold">{email}</span>
          </p>

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

          {success && (
            <div className="alert alert-success">
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label justify-center">
                <span className="label-text text-lg">Enter OTP</span>
              </label>
              <input
                type="text"
                value={otp}
                onChange={handleOTPChange}
                placeholder="000000"
                className="input input-bordered input-lg text-center text-2xl tracking-widest font-bold"
                maxLength={6}
                autoFocus
                required
              />
              <label className="label justify-center">
                <span className="label-text-alt text-gray-500">
                  OTP expires in 10 minutes
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </button>
          </form>

          <div className="divider">OR</div>

          <button
            type="button"
            onClick={handleResend}
            className="btn btn-outline w-full"
            disabled={resendLoading || countdown > 0}
          >
            {resendLoading ? (
              <>
                <span className="loading loading-spinner"></span>
                Sending...
              </>
            ) : countdown > 0 ? (
              `Resend OTP in ${countdown}s`
            ) : (
              "Resend OTP"
            )}
          </button>

          <p className="text-center text-sm mt-4">
            Wrong email?{" "}
            <Link to="/register" className="link link-primary">
              Go back to registration
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPPage;
