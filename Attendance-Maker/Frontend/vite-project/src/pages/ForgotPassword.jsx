
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [stage, setStage] = useState(1);
  const [resetToken, setResetToken] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Stage 1: Send OTP
  async function handleSendOTP(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await api.post(
        "/admin/forgot-password/send-otp",
        { email: email.trim() }
      );

      setMessage(
        response.data.message || "OTP sent successfully."
      );
      setStage(2);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // Stage 2: Verify OTP
  async function handleVerifyOTP(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await api.post(
        "/admin/forgot-password/verify-otp",
        {
          email: email.trim(),
          otp: otp.trim()
        }
      );

      setResetToken(response.data.resetToken);
      setMessage("OTP verified successfully.");
      setStage(3);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // Stage 3: Reset password
  async function handleResetPassword(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        "/admin/reset-password",
        {
          email: email.trim(),
          resetToken,
          newPassword
        }
      );

      setMessage(
        response.data.message ||
          "Password reset successfully. Please login."
      );

      setStage(4);
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setResetToken("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to reset password. Please try again."
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
          stage === 1
            ? handleSendOTP
            : stage === 2
            ? handleVerifyOTP
            : handleResetPassword
        }
      >
        <div className="auth-header">
          <div className="auth-logo">🔐</div>

          <h2>
            {stage === 1 && "Forgot Password?"}
            {stage === 2 && "Verify OTP"}
            {stage === 3 && "Reset Password"}
            {stage === 4 && "Password Updated"}
          </h2>

          <p>
            {stage === 1 &&
              "Enter your registered email to reset your password."}
            {stage === 2 &&
              `Enter the 6-digit OTP sent to ${email}.`}
            {stage === 3 &&
              "Create a new password for your account."}
            {stage === 4 &&
              "Your password has been changed successfully."}
          </p>
        </div>

        {stage === 1 && (
          <div className="form-group">
            <label htmlFor="email">Registered Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              autoComplete="email"
              required
            />
          </div>
        )}

        {stage === 2 && (
          <div className="form-group">
            <label htmlFor="otp">6-Digit OTP</label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, ""))
              }
              placeholder="Enter OTP"
              autoComplete="one-time-code"
              required
            />
          </div>
        )}

        {stage === 3 && (
          <>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Confirm new password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
          </>
        )}

        {stage < 4 && (
          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : stage === 1
              ? "Send OTP"
              : stage === 2
              ? "Verify OTP"
              : "Reset Password"}
          </button>
        )}

        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}

        {stage === 2 && (
          <button
            type="button"
            className="auth-button"
            disabled={loading}
            onClick={() => {
              setStage(1);
              setOtp("");
              setError("");
              setMessage("");
            }}
          >
            Change Email
          </button>
        )}

        <p className="auth-footer">
          {stage === 4 ? (
            <Link to="/login">Go to Login</Link>
          ) : (
            <>
              Remember your password? <Link to="/login">Login</Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}

export default ForgotPassword;
