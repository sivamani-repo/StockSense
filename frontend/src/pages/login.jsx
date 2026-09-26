
import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { loginUser } from "../services/authservice";
import { apiRequest } from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.email.trim() || !form.password) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await loginUser(
        form.email.trim(),
        form.password
      );

      if (!data?.access_token) {
        throw new Error(
          "Login succeeded but no access token was returned."
        );
      }

      localStorage.setItem(
        "access_token",
        data.access_token
      );

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      setError(
        error?.message ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSuccess(
    credentialResponse
  ) {
    const googleIdToken =
      credentialResponse?.credential;

    if (!googleIdToken) {
      setError(
        "Google sign-in did not return a valid credential."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await apiRequest(
        "/auth/google",
        {
          method: "POST",
          body: JSON.stringify({
            id_token: googleIdToken,
          }),
        }
      );

      if (!data?.access_token) {
        throw new Error(
          "Google sign-in succeeded, but StockSense did not return an access token."
        );
      }

      localStorage.setItem(
        "access_token",
        data.access_token
      );

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      setError(
        error?.message ||
        "Google sign-in failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleError() {
    setError(
      "Google sign-in was cancelled or could not be completed."
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-card">

        {/* Brand */}
        <div className="auth-logo">
          <div className="logo-mark">
            S
          </div>

          <div>
            <h1>StockSense</h1>

            <span>
              Inventory Management System
            </span>
          </div>
        </div>

        {/* Heading */}
        <div className="auth-heading">
          <h2>Welcome back</h2>

          <p>
            Sign in to manage your inventory.
          </p>
        </div>

        {/* Email / Password Login */}
        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="password">
                Password
              </label>

              <Link to="/forgot-password">
                Forgot password?
              </Link>
            </div>

            <div className="password-wrapper">
              <input
                id="password"
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    (value) => !value
                  )
                }
                disabled={loading}
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="auth-error"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Email Login */}
          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign in"}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span />
          <p>OR</p>
          <span />
        </div>

        {/* Google Login */}
        <div className="google-login-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            theme="outline"
            size="large"
            text="continue_with"
            shape="rectangular"
            width="350"
          />
        </div>

        {/* Signup */}
        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/signup">
            Create account
          </Link>
        </p>
      </section>
    </main>
  );
}
