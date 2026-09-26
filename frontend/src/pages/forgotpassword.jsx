
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  requestPasswordReset,
  resetPassword,
} from "../services/authService";

/* ================================================================
   STOCKSENSE - FORGOT PASSWORD
   Premium multi-step password recovery experience
   Existing backend/API flow preserved
   ================================================================ */

function MailIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 5.5h16c.83 0 1.5.67 1.5 1.5v10c0 .83-.67 1.5-1.5 1.5H4c-.83 0-1.5-.67-1.5-1.5V7c0-.83.67-1.5 1.5-1.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m3.2 7.1 7.56 5.76a2 2 0 0 0 2.48 0l7.56-5.76"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LockIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="10"
        width="16"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 10V7a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 14v3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShieldIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3.5 19 6v5.6c0 4.45-2.95 7.82-7 9.4-4.05-1.58-7-4.95-7-9.4V6l7-2.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m9 12 2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m5 12.5 4.2 4.2L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowLeftIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M19 12H5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="m11 18-6-6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="m13 6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeIcon({ open, size = 19 }) {
  if (open) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M2.5 12s3.45-6 9.5-6 9.5 6 9.5 6-3.45 6-9.5 6-9.5-6-9.5-6Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle
          cx="12"
          cy="12"
          r="2.7"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 3.5 21 20.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M9.9 6.25A9.1 9.1 0 0 1 12 6c6.05 0 9.5 6 9.5 6a18 18 0 0 1-3.07 3.54"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6.25 8.4C3.96 10.02 2.5 12 2.5 12s3.45 6 9.5 6c1.08 0 2.05-.18 2.92-.47"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Spinner({ size = 18 }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: "2px solid currentColor",
        borderTopColor: "transparent",
        display: "inline-block",
        animation: "stocksense-spin .75s linear infinite",
      }}
    />
  );
}

function StepIndicator({ step }) {
  const steps = [
    {
      number: 1,
      label: "Email",
    },
    {
      number: 2,
      label: "Verify",
    },
    {
      number: 3,
      label: "Complete",
    },
  ];

  return (
    <div
      className="forgot-stepper"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr auto 1fr",
        alignItems: "center",
        marginTop: "26px",
        marginBottom: "28px",
        gap: "10px",
      }}
    >
      {steps.map((item, index) => {
        const active = step === item.number;
        const completed = step > item.number;

        return (
          <div
            key={item.number}
            style={{
              display: "contents",
            }}
          >
            <div
              className={
                active
                  ? "forgot-step active"
                  : completed
                  ? "forgot-step completed"
                  : "forgot-step"
              }
              style={{
                minWidth: "0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "13px",
                    fontWeight: "800",
                    border: "1px solid rgba(15, 23, 42, .12)",
                    background:
                      completed || active
                        ? "#101827"
                        : "rgba(148, 163, 184, .12)",
                    color:
                      completed || active
                        ? "#ffffff"
                        : "#64748b",
                    boxShadow:
                      active
                        ? "0 0 0 5px rgba(16, 24, 39, .07)"
                        : "none",
                    transition:
                      "all .25s ease",
                  }}
                >
                  {completed ? (
                    <CheckIcon size={17} />
                  ) : (
                    item.number
                  )}
                </span>

                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: active
                      ? "800"
                      : "600",
                    color: active
                      ? "#111827"
                      : "#94a3b8",
                    letterSpacing:
                      ".02em",
                  }}
                >
                  {item.label}
                </span>
              </div>
            </div>

            {index <
              steps.length - 1 && (
              <span
                aria-hidden="true"
                style={{
                  height: "1px",
                  width: "100%",
                  background:
                    step > item.number
                      ? "#111827"
                      : "rgba(148, 163, 184, .25)",
                  transition:
                    "background .25s ease",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PasswordStrength({ password }) {
  const strength = useMemo(() => {
    if (!password) {
      return {
        score: 0,
        label: "Enter a password",
        width: "0%",
      };
    }

    let score = 0;

    if (password.length >= 8) {
      score += 1;
    }

    if (password.length >= 12) {
      score += 1;
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    }

    if (/[0-9]/.test(password)) {
      score += 1;
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    }

    if (score <= 2) {
      return {
        score,
        label: "Weak password",
        width: "35%",
      };
    }

    if (score <= 4) {
      return {
        score,
        label: "Good password",
        width: "70%",
      };
    }

    return {
      score,
      label: "Strong password",
      width: "100%",
    };
  }, [password]);

  if (!password) {
    return null;
  }

  return (
    <div
      className="password-strength"
      style={{
        marginTop: "8px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "12px",
          marginBottom: "6px",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            fontWeight: "700",
            color: "#64748b",
          }}
        >
          Password strength
        </span>

        <span
          style={{
            fontSize: "11px",
            fontWeight: "800",
            color: "#334155",
          }}
        >
          {strength.label}
        </span>
      </div>

      <div
        style={{
          height: "5px",
          width: "100%",
          borderRadius: "999px",
          background:
            "rgba(148, 163, 184, .15)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: strength.width,
            height: "100%",
            borderRadius: "999px",
            background: "#111827",
            transition:
              "width .3s ease",
          }}
        />
      </div>
    </div>
  );
}

export default function ForgotPassword() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");

  const [otp, setOtp] = useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [focusedField, setFocusedField] =
    useState("");

  async function handleRequestOtp(event) {
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
       * Existing backend behavior preserved.
       * In development mode the backend may
       * return an OTP for testing.
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
      setError(
        "Please enter the OTP."
      );
      return;
    }

    if (otp.trim().length !== 6) {
      setError(
        "Please enter the 6-digit OTP."
      );
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
      return;
    }

    if (step === 1) {
      setStep(1);
    }
  }

  function handleEmailChange(event) {
    setEmail(event.target.value);
    setError("");
    setSuccess("");
  }

  function handleOtpChange(event) {
    const cleanOtp =
      event.target.value.replace(
        /\D/g,
        ""
      );

    setOtp(cleanOtp);
    setError("");
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
    setError("");
  }

  function handleConfirmPasswordChange(
    event
  ) {
    setConfirmPassword(
      event.target.value
    );
    setError("");
  }

  const emailLooksValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email.trim()
    );

  const otpComplete =
    otp.trim().length === 6;

  const passwordReady =
    password.length >= 8 &&
    password === confirmPassword;

  return (
    <>
      <style>{`
        @keyframes stocksense-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes stocksense-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-7px);
          }
        }

        @keyframes stocksense-pulse {
          0%, 100% {
            opacity: .35;
            transform: scale(1);
          }
          50% {
            opacity: .7;
            transform: scale(1.08);
          }
        }

        .forgot-visual-orb {
          animation:
            stocksense-float 5s ease-in-out infinite;
        }

        .forgot-mini-pulse {
          animation:
            stocksense-pulse 3s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .forgot-visual-orb,
          .forgot-mini-pulse {
            animation: none;
          }
        }
      `}</style>

      <main
        className="auth-page"
        style={{
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden="true"
          className="forgot-background-glow"
          style={{
            position: "absolute",
            width: "420px",
            height: "420px",
            borderRadius: "50%",
            left: "-180px",
            top: "-160px",
            background:
              "radial-gradient(circle, rgba(15,23,42,.08), transparent 68%)",
            pointerEvents: "none",
          }}
        />

        <div
          aria-hidden="true"
          className="forgot-background-glow"
          style={{
            position: "absolute",
            width: "480px",
            height: "480px",
            borderRadius: "50%",
            right: "-230px",
            bottom: "-230px",
            background:
              "radial-gradient(circle, rgba(15,23,42,.07), transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <section
          className="auth-card forgot-card"
          style={{
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            className="auth-logo"
            style={{
              marginBottom: "4px",
            }}
          >
            <div
              className="logo-mark"
              style={{
                position: "relative",
                overflow: "hidden",
              }}
            >
              S
            </div>

            <div>
              <h1>StockSense</h1>

              <span>
                Inventory Management System
              </span>
            </div>
          </div>

          <div
            className="forgot-security-strip"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginTop: "18px",
              padding: "10px 12px",
              borderRadius: "12px",
              background:
                "rgba(15, 23, 42, .045)",
              border:
                "1px solid rgba(15, 23, 42, .07)",
              color: "#475569",
              fontSize: "11px",
              fontWeight: "650",
            }}
          >
            <span
              className="forgot-mini-pulse"
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#111827",
                flexShrink: 0,
              }}
            />

            <span>
              Secure account recovery
            </span>

            <span
              style={{
                marginLeft: "auto",
                display: "inline-flex",
                alignItems: "center",
                color: "#64748b",
              }}
            >
              <ShieldIcon size={15} />
            </span>
          </div>

          <StepIndicator step={step} />

          {step === 1 && (
            <>
              <div
                className="auth-heading"
                style={{
                  position: "relative",
                }}
              >
                <div
                  className="forgot-visual-orb"
                  style={{
                    position: "absolute",
                    right: "0",
                    top: "-12px",
                    width: "48px",
                    height: "48px",
                    borderRadius: "16px",
                    display: "grid",
                    placeItems: "center",
                    background:
                      "rgba(15,23,42,.06)",
                    color: "#111827",
                  }}
                >
                  <MailIcon size={22} />
                </div>

                <h2>
                  Forgot password?
                </h2>

                <p>
                  Enter your email and
                  we&apos;ll send you an
                  OTP to continue.
                </p>
              </div>

              <form
                className="auth-form"
                onSubmit={handleRequestOtp}
              >
                <div className="form-group">
                  <label htmlFor="email">
                    Email address
                  </label>

                  <div
                    className="forgot-input-shell"
                    style={{
                      position: "relative",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        position:
                          "absolute",
                        left: "14px",
                        top: "50%",
                        transform:
                          "translateY(-50%)",
                        color:
                          focusedField ===
                          "email"
                            ? "#111827"
                            : "#94a3b8",
                        pointerEvents:
                          "none",
                        display:
                          "inline-flex",
                        transition:
                          "color .2s ease",
                      }}
                    >
                      <MailIcon size={18} />
                    </span>

                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      value={email}
                      onFocus={() =>
                        setFocusedField(
                          "email"
                        )
                      }
                      onBlur={() =>
                        setFocusedField("")
                      }
                      onChange={
                        handleEmailChange
                      }
                      style={{
                        paddingLeft:
                          "44px",
                      }}
                    />
                  </div>

                  {email.length > 0 && (
                    <div
                      style={{
                        marginTop: "7px",
                        fontSize: "11px",
                        fontWeight: "650",
                        color:
                          emailLooksValid
                            ? "#475569"
                            : "#94a3b8",
                      }}
                    >
                      {emailLooksValid
                        ? "Email format looks good."
                        : "Enter a valid email address."}
                    </div>
                  )}
                </div>

                {error && (
                  <div
                    className="auth-error"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    loading ||
                    !email.trim()
                  }
                  style={{
                    display: "flex",
                    justifyContent:
                      "center",
                    alignItems: "center",
                    gap: "9px",
                  }}
                >
                  {loading ? (
                    <>
                      <Spinner size={17} />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send OTP
                      <ArrowRightIcon
                        size={17}
                      />
                    </>
                  )}
                </button>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "center",
                    gap: "7px",
                    marginTop: "4px",
                    color: "#94a3b8",
                    fontSize: "11px",
                    fontWeight: "600",
                  }}
                >
                  <LockIcon size={13} />
                  Your account details
                  stay protected.
                </div>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div
                className="auth-heading"
                style={{
                  position: "relative",
                }}
              >
                <div
                  className="forgot-visual-orb"
                  style={{
                    position: "absolute",
                    right: "0",
                    top: "-12px",
                    width: "48px",
                    height: "48px",
                    borderRadius: "16px",
                    display: "grid",
                    placeItems: "center",
                    background:
                      "rgba(15,23,42,.06)",
                    color: "#111827",
                  }}
                >
                  <LockIcon size={22} />
                </div>

                <h2>
                  Reset password
                </h2>

                <p>
                  Enter the 6-digit OTP
                  sent to{" "}
                  <strong>
                    {email}
                  </strong>
                  .
                </p>
              </div>

              <div
                className="forgot-email-preview"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "11px 13px",
                  marginBottom: "20px",
                  borderRadius: "12px",
                  background:
                    "rgba(15,23,42,.035)",
                  border:
                    "1px solid rgba(15,23,42,.06)",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "9px",
                    display: "grid",
                    placeItems: "center",
                    background:
                      "#111827",
                    color: "#ffffff",
                    flexShrink: 0,
                  }}
                >
                  <MailIcon size={16} />
                </div>

                <div
                  style={{
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#94a3b8",
                      fontWeight: "700",
                      textTransform:
                        "uppercase",
                      letterSpacing:
                        ".08em",
                    }}
                  >
                    Recovery email
                  </div>

                  <div
                    style={{
                      marginTop: "2px",
                      fontSize: "12px",
                      color: "#334155",
                      fontWeight: "750",
                      overflow: "hidden",
                      textOverflow:
                        "ellipsis",
                      whiteSpace:
                        "nowrap",
                    }}
                  >
                    {email}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleBack}
                  style={{
                    marginLeft: "auto",
                    border: "none",
                    background:
                      "transparent",
                    color: "#475569",
                    cursor: "pointer",
                    fontSize: "11px",
                    fontWeight: "800",
                    padding: "6px",
                  }}
                >
                  Edit
                </button>
              </div>

              <form
                className="auth-form"
                onSubmit={
                  handleResetPassword
                }
              >
                <div className="form-group">
                  <label htmlFor="otp">
                    Verification code
                  </label>

                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={
                      handleOtpChange
                    }
                    style={{
                      textAlign: "center",
                      letterSpacing:
                        ".48em",
                      fontSize: "18px",
                      fontWeight: "800",
                      paddingLeft:
                        "18px",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      marginTop: "7px",
                      fontSize: "10px",
                      fontWeight: "650",
                      color: "#94a3b8",
                    }}
                  >
                    <span>
                      Enter the code
                      sent to your
                      email
                    </span>

                    <span
                      style={{
                        color:
                          otpComplete
                            ? "#334155"
                            : "#94a3b8",
                        fontWeight: "800",
                      }}
                    >
                      {otp.length}/6
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">
                    New password
                  </label>

                  <div
                    style={{
                      position: "relative",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        position:
                          "absolute",
                        left: "14px",
                        top: "50%",
                        transform:
                          "translateY(-50%)",
                        color: "#94a3b8",
                        display:
                          "inline-flex",
                        pointerEvents:
                          "none",
                      }}
                    >
                      <LockIcon size={17} />
                    </span>

                    <input
                      id="newPassword"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Create a new password"
                      autoComplete="new-password"
                      value={password}
                      onChange={
                        handlePasswordChange
                      }
                      style={{
                        paddingLeft:
                          "43px",
                        paddingRight:
                          "48px",
                      }}
                    />

                    <button
                      type="button"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      onClick={() =>
                        setShowPassword(
                          (value) =>
                            !value
                        )
                      }
                      style={{
                        position:
                          "absolute",
                        right: "10px",
                        top: "50%",
                        transform:
                          "translateY(-50%)",
                        width: "34px",
                        height: "34px",
                        display:
                          "grid",
                        placeItems:
                          "center",
                        border:
                          "none",
                        borderRadius:
                          "9px",
                        background:
                          "transparent",
                        color:
                          "#64748b",
                        cursor:
                          "pointer",
                      }}
                    >
                      <EyeIcon
                        open={
                          showPassword
                        }
                        size={18}
                      />
                    </button>
                  </div>

                  <PasswordStrength
                    password={password}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    Confirm password
                  </label>

                  <div
                    style={{
                      position: "relative",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        position:
                          "absolute",
                        left: "14px",
                        top: "50%",
                        transform:
                          "translateY(-50%)",
                        color: "#94a3b8",
                        display:
                          "inline-flex",
                        pointerEvents:
                          "none",
                      }}
                    >
                      <CheckIcon size={17} />
                    </span>

                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      value={
                        confirmPassword
                      }
                      onChange={
                        handleConfirmPasswordChange
                      }
                      style={{
                        paddingLeft:
                          "43px",
                        paddingRight:
                          "48px",
                      }}
                    />

                    <button
                      type="button"
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      onClick={() =>
                        setShowConfirmPassword(
                          (value) =>
                            !value
                        )
                      }
                      style={{
                        position:
                          "absolute",
                        right: "10px",
                        top: "50%",
                        transform:
                          "translateY(-50%)",
                        width: "34px",
                        height: "34px",
                        display:
                          "grid",
                        placeItems:
                          "center",
                        border:
                          "none",
                        borderRadius:
                          "9px",
                        background:
                          "transparent",
                        color:
                          "#64748b",
                        cursor:
                          "pointer",
                      }}
                    >
                      <EyeIcon
                        open={
                          showConfirmPassword
                        }
                        size={18}
                      />
                    </button>
                  </div>

                  {confirmPassword && (
                    <div
                      style={{
                        display: "flex",
                        alignItems:
                          "center",
                        gap: "6px",
                        marginTop: "7px",
                        color:
                          passwordReady
                            ? "#475569"
                            : "#94a3b8",
                        fontSize: "11px",
                        fontWeight: "700",
                      }}
                    >
                      {passwordReady ? (
                        <>
                          <CheckIcon
                            size={14}
                          />
                          Passwords
                          match
                        </>
                      ) : (
                        "Passwords do not match yet."
                      )}
                    </div>
                  )}
                </div>

                {error && (
                  <div
                    className="auth-error"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="primary-button"
                  disabled={loading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "center",
                    gap: "9px",
                  }}
                >
                  {loading ? (
                    <>
                      <Spinner size={17} />
                      Resetting...
                    </>
                  ) : (
                    <>
                      Reset password
                      <ArrowRightIcon
                        size={17}
                      />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleBack}
                  disabled={loading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "center",
                    gap: "8px",
                  }}
                >
                  <ArrowLeftIcon
                    size={16}
                  />
                  Back
                </button>

                <div
                  style={{
                    marginTop: "3px",
                    padding:
                      "10px 12px",
                    borderRadius:
                      "11px",
                    background:
                      "rgba(15,23,42,.035)",
                    color: "#64748b",
                    fontSize: "10px",
                    lineHeight: "1.55",
                    textAlign: "center",
                  }}
                >
                  Choose a password with
                  at least 8 characters.
                  Avoid using passwords
                  you've used elsewhere.
                </div>
              </form>
            </>
          )}

          {step === 3 && (
            <div
              className="success-state"
              style={{
                paddingTop: "10px",
              }}
            >
              <div
                className="success-icon"
                style={{
                  animation:
                    "stocksense-float 4s ease-in-out infinite",
                }}
              >
                <CheckIcon size={30} />
              </div>

              <h2>
                Password reset
              </h2>

              <p>
                {success}
              </p>

              <div
                style={{
                  marginTop: "16px",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  gap: "8px",
                  padding:
                    "11px 13px",
                  borderRadius:
                    "12px",
                  background:
                    "rgba(15,23,42,.04)",
                  color: "#475569",
                  fontSize: "11px",
                  fontWeight: "700",
                }}
              >
                <ShieldIcon size={16} />
                Your account is ready
                for secure sign in.
              </div>

              <Link
                to="/login"
                className="primary-button link-button"
                style={{
                  marginTop: "18px",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  gap: "8px",
                }}
              >
                Back to login
                <ArrowRightIcon
                  size={17}
                />
              </Link>
            </div>
          )}

          {step !== 3 && (
            <p
              className="auth-switch"
              style={{
                marginTop: "24px",
              }}
            >
              Remember your password?{" "}
              <Link to="/login">
                Sign in
              </Link>
            </p>
          )}

          <div
            style={{
              display: "flex",
              justifyContent:
                "center",
              alignItems: "center",
              gap: "6px",
              marginTop: "18px",
              paddingTop: "14px",
              borderTop:
                "1px solid rgba(148,163,184,.12)",
              color: "#94a3b8",
              fontSize: "9px",
              fontWeight: "700",
              letterSpacing: ".04em",
              textTransform:
                "uppercase",
            }}
          >
            <ShieldIcon size={12} />
            StockSense Secure Recovery
          </div>
        </section>
      </main>
    </>
  );
}
