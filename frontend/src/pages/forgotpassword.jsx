import { useState } from "react";
import { Link } from "react-router-dom";

import {
  requestPasswordReset,
  resetPassword,
} from "../services/authService";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);

  const [email, setEmail] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  async function handleRequestOtp(
    event
  ) {
    event.preventDefault();

    if (!email.trim()) {
      setError(
        "Please enter your email."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response =
        await requestPasswordReset(
          email.trim()
        );

      /*
       * Development mode may return an OTP
       * from the existing backend.
       */
      if (response?.otp) {
        console.log(
          "Development OTP:",
          response.otp
        );
      }

      setStep(2);
    } catch (error) {
      setError(
        error.message ||
          "Unable to request OTP."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(
    event
  ) {
    event.preventDefault();

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    if (!password) {
      setError(
        "Please enter a new password."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (
      password !== confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await resetPassword(
        email.trim(),
        otp.trim(),
        password
      );

      setSuccess(
        "Your password has been reset successfully."
      );

      setStep(3);
    } catch (error) {
      setError(
        error.message ||
          "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    setError("");
    setSuccess("");

    if (step === 2) {
      setStep(1);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-logo">
          <div className="logo-mark">S</div>

          <div>
            <h1>StockSense</h1>
            <span>
              Inventory Management System
            </span>
          </div>
        </div>

        {step === 1 && (
          <>
            <div className="auth-heading">
              <h2>Forgot password?</h2>

              <p>
                Enter your email and we'll
                send you an OTP.
              </p>
            </div>

            <form
              className="auth-form"
              onSubmit={handleRequestOtp}
            >
              <div className="form-group">
                <label htmlFor="email">
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(
                      event.target.value
                    );
                    setError("");
                  }}
                />
              </div>

              {error && (
                <div className="auth-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading
                  ? "Sending..."
                  : "Send OTP"}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <div className="auth-heading">
              <h2>Reset password</h2>

              <p>
                Enter the OTP sent to{" "}
                <strong>{email}</strong>.
              </p>
            </div>

            <form
              className="auth-form"
              onSubmit={handleResetPassword}
            >
              <div className="form-group">
                <label htmlFor="otp">
                  OTP
                </label>

                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(event) => {
                    setOtp(
                      event.target.value.replace(
                        /\D/g,
                        ""
                      )
                    );
                    setError("");
                  }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">
                  New password
                </label>

                <input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(event) => {
                    setPassword(
                      event.target.value
                    );
                    setError("");
                  }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  Confirm password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={
                    confirmPassword
                  }
                  onChange={(event) => {
                    setConfirmPassword(
                      event.target.value
                    );
                    setError("");
                  }}
                />
              </div>

              {error && (
                <div className="auth-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading
                  ? "Resetting..."
                  : "Reset password"}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={handleBack}
              >
                Back
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <div className="success-state">
            <div className="success-icon">
              ✓
            </div>

            <h2>Password reset</h2>

            <p>
              {success}
            </p>

            <Link
              to="/login"
              className="primary-button link-button"
            >
              Back to login
            </Link>
          </div>
        )}

        {step !== 3 && (
          <p className="auth-switch">
            Remember your password?{" "}
            <Link to="/login">
              Sign in
            </Link>
          </p>
        )}
      </section>
    </main>
  );
}