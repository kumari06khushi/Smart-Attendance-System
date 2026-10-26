
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Register.css";

function Register() {
  const [step, setStep] = useState(1);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const normalizedEmail = email.trim().toLowerCase();

  function clearMessages() {
    setMessage("");
    setError("");
  }

  function getErrorMessage(err, fallback) {
    return (
      err.response?.data?.error ||
      err.response?.data?.message ||
      fallback
    );
  }

  // STEP 1: Send OTP
  async function handleSendOTP(e) {
    e.preventDefault();
    clearMessages();

    if (!name.trim() || !normalizedEmail) {
      setError("Please enter your name and email.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/admin/send-otp", {
        email: normalizedEmail,
      });

      setStep(2);
      setOtp("");
      setMessage(
        response.data.message ||
          "OTP sent successfully. Please check your inbox."
      );
    } catch (err) {
      setError(
        getErrorMessage(err, "Unable to send OTP. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  }

  // STEP 2: Verify OTP
  async function handleVerifyOTP(e) {
    e.preventDefault();
    clearMessages();

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/admin/verify-otp", {
        email: normalizedEmail,
        otp,
      });

      setStep(3);
      setOtp("");
      setMessage(
        response.data.message || "Email verified successfully."
      );
    } catch (err) {
      setError(
        getErrorMessage(err, "OTP verification failed. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  }

  // Resend OTP
  async function handleResendOTP() {
    clearMessages();
    setLoading(true);

    try {
      const response = await api.post("/admin/send-otp", {
        email: normalizedEmail,
      });

      setOtp("");
      setMessage(
        response.data.message ||
          "A new OTP has been sent to your email."
      );
    } catch (err) {
      setError(
        getErrorMessage(err, "Unable to resend OTP. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  }

  // STEP 3: Create Account
  async function handleCreateAccount(e) {
    e.preventDefault();
    clearMessages();

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/admin/register", {
        name: name.trim(),
        email: normalizedEmail,
        password,
      });

      setMessage(
        response.data.message || "Registration successful."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError(
        getErrorMessage(err, "Registration failed. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <form
        className="auth-form"
        onSubmit={
          step === 1
            ? handleSendOTP
            : step === 2
              ? handleVerifyOTP
              : handleCreateAccount
        }
      >
        <div className="auth-header">
          <div className="auth-logo">🎓</div>
          <h2>Create Admin Account</h2>
          <p>Register to manage student attendance</p>
        </div>

        {/* Progress indicator */}
        <div className="step-progress">
          {[1, 2, 3].map((item) => (
            <div
              className={`step-item ${
                step >= item ? "active" : ""
              }`}
              key={item}
            >
              <div className="step-circle">
                {step > item ? "✓" : item}
              </div>
              <span className="step-label">
                {item === 1
                  ? "Details"
                  : item === 2
                    ? "Verify"
                    : "Password"}
              </span>
            </div>
          ))}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="step-content">
            <h3>Enter your details</h3>
            <p className="step-description">
              We'll send a verification OTP to your email address.
            </p>

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                autoComplete="name"
                maxLength={100}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                autoComplete="email"
                required
              />
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="step-content">
            <h3>Verify your email</h3>
            <p className="step-description">
              Enter the 6-digit OTP sent to:
            </p>

            <p className="email-display">{normalizedEmail}</p>

            <p className="otp-note">
              OTP is valid for 5 minutes.
            </p>

            <div className="form-group">
              <label htmlFor="otp">Verification OTP</label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                pattern="[0-9]{6}"
                required
              />
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              className="text-button"
              onClick={handleResendOTP}
              disabled={loading}
            >
              Resend OTP
            </button>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="step-content">
            <h3>Create your password</h3>
            <p className="step-description">
              Your email has been verified. Set a password for your account.
            </p>

            <div className="verified-email">
              <span className="verified-icon">✓</span>
              <span>{normalizedEmail}</span>
              <span className="verified-label">Verified</span>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                autoComplete="new-password"
                minLength={8}
                required
              />
              <p className="input-hint">
                Use at least 8 characters.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Re-enter your password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        )}

        {message && (
          <p className="success-message" role="status">
            {message}
          </p>
        )}

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
