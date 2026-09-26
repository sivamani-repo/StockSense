import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

import {
  signupUser,
  googleLogin,
} from "../services/authService";

/* ========================================================================
   STOCKSENSE
   ULTRA CREATE ACCOUNT EXPERIENCE
   ------------------------------------------------------------------------
   Frontend-only UI enhancement.
   Existing authentication/business logic preserved.
   No additional packages required.
   ======================================================================== */

/* ========================================================================
   ICONS
   ======================================================================== */

function UserIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="8"
        r="3.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M5 20c.7-3.55 3.1-5.5 7-5.5s6.3 1.95 7 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MailIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2.3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m4.5 7 6.1 4.65a2.2 2.2 0 0 0 2.8 0L19.5 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LockIcon({ size = 18 }) {
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
      <circle
        cx="12"
        cy="15"
        r="1.2"
        fill="currentColor"
      />
    </svg>
  );
}

function EyeIcon({
  open,
  size = 18,
}) {
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
          strokeWidth="1.7"
        />
        <circle
          cx="12"
          cy="12"
          r="2.7"
          stroke="currentColor"
          strokeWidth="1.7"
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
        d="M9.9 6.25A8.9 8.9 0 0 1 12 6c6.05 0 9.5 6 9.5 6a18 18 0 0 1-3.12 3.57"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M6.3 8.45C3.95 10.05 2.5 12 2.5 12s3.45 6 9.5 6c1.05 0 2.02-.17 2.88-.45"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShieldIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3.5 19 6v5.4c0 4.45-2.96 7.86-7 9.45-4.04-1.59-7-5-7-9.45V6l7-2.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m8.8 12 2.1 2.1 4.4-4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon({ size = 18 }) {
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

function TruckIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 6.5h11v9.5H3z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M14 10h3.5l3 3.2V16H14z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle
        cx="7"
        cy="17"
        r="1.8"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle
        cx="18"
        cy="17"
        r="1.8"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function BoxesIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m12 3 8 4.2v9.6L12 21l-8-4.2V7.2L12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M4.4 7.4 12 11.5l7.6-4.1M12 11.5V21"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WarehouseIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 9.2 12 4l9 5.2v10.3H3V9.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M7 19.5v-6h4v6M13 19.5v-6h4v6"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

/* ========================================================================
   SPINNER
   ======================================================================== */

function Spinner() {
  return (
    <span
      className="ss-signup-spinner"
      aria-hidden="true"
    />
  );
}

/* ========================================================================
   CSS 3D TRUCK
   ======================================================================== */

function MovingTruck({
  className = "",
  label = "",
}) {
  return (
    <div
      className={`ss-signup-truck ${className}`}
    >
      <div className="ss-signup-truck-shadow" />

      <div className="ss-signup-truck-body">
        <div className="ss-signup-trailer">
          <span />
          <span />
          <span />
        </div>

        <div className="ss-signup-truck-cab">
          <div className="ss-signup-truck-window" />

          <div className="ss-signup-truck-light a" />
          <div className="ss-signup-truck-light b" />
        </div>

        <div className="ss-signup-truck-bumper" />
      </div>

      <div className="ss-signup-wheel left">
        <i />
      </div>

      <div className="ss-signup-wheel right">
        <i />
      </div>

      {label && (
        <div className="ss-signup-truck-label">
          {label}
        </div>
      )}
    </div>
  );
}

/* ========================================================================
   LIVE DATA CARD
   ======================================================================== */

function LiveDataCard({
  icon: Icon,
  title,
  value,
  className = "",
}) {
  return (
    <div
      className={`ss-signup-live-card ${className}`}
    >
      <div className="ss-signup-live-icon">
        <Icon size={15} />
      </div>

      <div>
        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>
      </div>

      <i />
    </div>
  );
}

/* ========================================================================
   PASSWORD STRENGTH
   ======================================================================== */

function getPasswordStrength(password) {
  if (!password) {
    return {
      level: 0,
      label: "Create a secure password",
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
      level: score,
      label: "Weak",
      width: "32%",
    };
  }

  if (score <= 4) {
    return {
      level: score,
      label: "Good",
      width: "68%",
    };
  }

  return {
    level: score,
    label: "Strong",
    width: "100%",
  };
}

/* ========================================================================
   PASSWORD STATUS
   ======================================================================== */

function PasswordStatus({
  password,
  confirmPassword,
}) {
  const strength =
    getPasswordStrength(
      password
    );

  const matched =
    Boolean(
      password &&
      confirmPassword &&
      password ===
        confirmPassword
    );

  if (
    !password &&
    !confirmPassword
  ) {
    return null;
  }

  return (
    <div className="ss-signup-password-status">
      {password && (
        <div className="ss-signup-strength">
          <div className="ss-signup-strength-head">
            <span>
              Password strength
            </span>

            <strong>
              {strength.label}
            </strong>
          </div>

          <div className="ss-signup-strength-track">
            <span
              style={{
                width:
                  strength.width,
              }}
            />
          </div>
        </div>
      )}

      {confirmPassword && (
        <div
          className={
            matched
              ? "ss-signup-match good"
              : "ss-signup-match"
          }
        >
          <span>
            {matched ? (
              <CheckIcon size={13} />
            ) : (
              "!"
            )}
          </span>

          {matched
            ? "Passwords match"
            : "Passwords do not match"}
        </div>
      )}
    </div>
  );
}

/* ========================================================================
   MAIN COMPONENT
   ======================================================================== */

export default function Signup() {
  const navigate =
    useNavigate();

  const [form, setForm] =
    useState({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "warehouse_staff",
    });

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    focusedField,
    setFocusedField,
  ] = useState("");

  /* ======================================================================
     ORIGINAL FORM HANDLER — PRESERVED
     ====================================================================== */

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  }

  /* ======================================================================
     ORIGINAL SIGNUP FLOW — PRESERVED
     ====================================================================== */

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError(
        "Please fill in all fields."
      );

      return;
    }

    if (
      form.password.length < 8
    ) {
      setError(
        "Password must be at least 8 characters."
      );

      return;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      await signupUser(
        form.name.trim(),
        form.email.trim(),
        form.password,
        form.role
      );

      navigate("/login", {
        replace: true,

        state: {
          message:
            "Account created successfully. Please sign in.",
        },
      });
    } catch (err) {
      setError(
        err.message ||
          "Signup failed."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ======================================================================
     ORIGINAL GOOGLE FLOW — PRESERVED
     ====================================================================== */

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

      const data =
        await googleLogin(
          googleIdToken
        );

      if (
        !data?.access_token
      ) {
        throw new Error(
          "Google sign-in succeeded, but no token was returned."
        );
      }

      localStorage.setItem(
        "access_token",
        data.access_token
      );

      navigate("/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(
        err?.message ||
          "Google authentication failed."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ======================================================================
     EMAIL VALIDATION — VISUAL ONLY
     ====================================================================== */

  const validEmail =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      form.email.trim()
    );

  const passwordReady =
    form.password.length >= 8;

  const formReady =
    Boolean(
      form.name.trim() &&
      validEmail &&
      passwordReady &&
      form.confirmPassword &&
      form.password ===
        form.confirmPassword
    );

  /* ======================================================================
     RENDER
     ====================================================================== */

  return (
    <>
      <style>{`

        /* ===============================================================
           ROOT
           =============================================================== */

        .ss-signup-page {
          --bg:
            #070b11;

          --panel:
            #0d131c;

          --panel-2:
            #111925;

          --text:
            #f5f7fa;

          --muted:
            #8792a1;

          --soft:
            #596473;

          --line:
            rgba(255,255,255,.085);

          --orange:
            #ff6228;

          --orange-light:
            #ff966d;

          position:
            relative;

          width:
            100%;

          min-height:
            100vh;

          overflow:
            hidden;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          padding:
            26px;

          background:
            radial-gradient(
              circle at 5% 15%,
              rgba(255,76,23,.12),
              transparent 25%
            ),
            radial-gradient(
              circle at 95% 90%,
              rgba(255,92,29,.08),
              transparent 28%
            ),
            var(--bg);

          color:
            var(--text);

          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        /* ===============================================================
           GRID
           =============================================================== */

        .ss-signup-grid {
          position:
            absolute;

          inset:
            0;

          opacity:
            .18;

          background-image:
            linear-gradient(
              rgba(255,255,255,.035) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,.035) 1px,
              transparent 1px
            );

          background-size:
            44px 44px;

          mask-image:
            linear-gradient(
              to bottom,
              transparent,
              black 15%,
              black 85%,
              transparent
            );

          pointer-events:
            none;
        }

        /* ===============================================================
           GLOW
           =============================================================== */

        .ss-signup-glow {
          position:
            absolute;

          width:
            460px;

          height:
            460px;

          border-radius:
            50%;

          background:
            radial-gradient(
              circle,
              rgba(255,84,27,.14),
              transparent 70%
            );

          filter:
            blur(15px);

          animation:
            ss-signup-glow 8s
            ease-in-out infinite;

          pointer-events:
            none;
        }

        .ss-signup-glow.a {
          left:
            -190px;

          top:
            -160px;
        }

        .ss-signup-glow.b {
          right:
            -210px;

          bottom:
            -180px;

          animation-delay:
            -3s;
        }

        @keyframes ss-signup-glow {
          0%,
          100% {
            opacity:
              .62;

            transform:
              scale(1);
          }

          50% {
            opacity:
              1;

            transform:
              scale(1.13);
          }
        }

        /* ===============================================================
           SHELL
           =============================================================== */

        .ss-signup-shell {
          position:
            relative;

          z-index:
            5;

          width:
            min(1450px, 100%);

          min-height:
            800px;

          display:
            grid;

          grid-template-columns:
            minmax(0, 1.08fr)
            minmax(430px, .92fr);

          overflow:
            hidden;

          border:
            1px solid
            rgba(255,255,255,.10);

          border-radius:
            31px;

          background:
            rgba(8,12,18,.90);

          box-shadow:
            0 42px 130px
            rgba(0,0,0,.54),
            inset 0 1px 0
            rgba(255,255,255,.035);

          backdrop-filter:
            blur(30px);

          -webkit-backdrop-filter:
            blur(30px);
        }

        /* ===============================================================
           LEFT VISUAL
           =============================================================== */

        .ss-signup-visual {
          position:
            relative;

          min-width:
            0;

          overflow:
            hidden;

          background:
            linear-gradient(
              90deg,
              rgba(4,7,11,.18),
              rgba(4,7,11,0)
            ),
            linear-gradient(
              180deg,
              rgba(4,7,11,.08),
              rgba(4,7,11,.53)
            ),
            url("/images/stocksense-warehouse.png")
            center /
            cover
            no-repeat,

            radial-gradient(
              circle at 70% 70%,
              #322018,
              #10141b 66%
            );

          border-right:
            1px solid
            rgba(255,255,255,.075);
        }

        .ss-signup-visual::after {
          content:
            "";

          position:
            absolute;

          inset:
            0;

          background:
            linear-gradient(
              90deg,
              rgba(5,8,12,.73),
              rgba(5,8,12,.31) 45%,
              transparent 84%
            );

          pointer-events:
            none;
        }

        .ss-signup-vignette {
          position:
            absolute;

          inset:
            0;

          z-index:
            1;

          background:
            radial-gradient(
              circle at 58% 48%,
              transparent 14%,
              rgba(2,4,7,.18) 58%,
              rgba(2,4,7,.73) 100%
            );

          pointer-events:
            none;
        }

        /* ===============================================================
           TOP NAV
           =============================================================== */

        .ss-signup-topbar {
          position:
            absolute;

          z-index:
            12;

          top:
            25px;

          left:
            27px;

          right:
            27px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;
        }

        .ss-signup-brand-pill {
          display:
            inline-flex;

          align-items:
            center;

          gap:
            9px;

          padding:
            7px 10px;

          border:
            1px solid
            rgba(255,255,255,.11);

          border-radius:
            12px;

          background:
            rgba(4,7,11,.30);

          backdrop-filter:
            blur(14px);
        }

        .ss-signup-brand-mark {
          width:
            27px;

          height:
            27px;

          display:
            grid;

          place-items:
            center;

          border-radius:
            8px;

          background:
            linear-gradient(
              145deg,
              #ff7d4b,
              #d9360c
            );

          color:
            white;

          font-size:
            12px;

          font-weight:
            950;

          box-shadow:
            0 0 20px
            rgba(255,85,29,.27);
        }

        .ss-signup-brand-pill span {
          color:
            rgba(255,255,255,.65);

          font-size:
            9px;

          font-weight:
            800;

          letter-spacing:
            .12em;

          text-transform:
            uppercase;
        }

        .ss-signup-status {
          display:
            inline-flex;

          align-items:
            center;

          gap:
            7px;

          padding:
            7px 10px;

          border:
            1px solid
            rgba(255,255,255,.10);

          border-radius:
            999px;

          background:
            rgba(5,8,12,.30);

          backdrop-filter:
            blur(14px);

          color:
            rgba(255,255,255,.59);

          font-size:
            8px;

          font-weight:
            800;

          letter-spacing:
            .09em;

          text-transform:
            uppercase;
        }

        .ss-signup-status-dot {
          width:
            6px;

          height:
            6px;

          border-radius:
            50%;

          background:
            #6cdb90;

          box-shadow:
            0 0 0 4px
            rgba(108,219,144,.08),
            0 0 13px
            rgba(108,219,144,.68);

          animation:
            ss-signup-status 2.3s
            ease-in-out infinite;
        }

        @keyframes ss-signup-status {
          0%,
          100% {
            opacity:
              .52;
          }

          50% {
            opacity:
              1;
          }
        }

        /* ===============================================================
           LEFT COPY
           =============================================================== */

        .ss-signup-visual-copy {
          position:
            absolute;

          z-index:
            12;

          left:
            50px;

          right:
            45px;

          bottom:
            230px;
        }

        .ss-signup-eyebrow {
          display:
            inline-flex;

          align-items:
            center;

          gap:
            8px;

          margin-bottom:
            13px;

          color:
            rgba(255,255,255,.61);

          font-size:
            9px;

          font-weight:
            850;

          letter-spacing:
            .17em;

          text-transform:
            uppercase;
        }

        .ss-signup-eyebrow-line {
          width:
            31px;

          height:
            1px;

          background:
            linear-gradient(
              90deg,
              var(--orange),
              transparent
            );
        }

        .ss-signup-visual-copy h2 {
          max-width:
            680px;

          margin:
            0;

          color:
            #fff;

          font-size:
            clamp(
              35px,
              4vw,
              63px
            );

          line-height:
            .96;

          letter-spacing:
            -.057em;

          font-weight:
            900;

          text-shadow:
            0 13px 37px
            rgba(0,0,0,.43);
        }

        .ss-signup-visual-copy h2 span {
          color:
            var(--orange-light);
        }

        .ss-signup-visual-copy p {
          max-width:
            555px;

          margin:
            17px 0 0;

          color:
            rgba(255,255,255,.62);

          font-size:
            12px;

          line-height:
            1.7;
        }

        /* ===============================================================
           LIVE CARDS
           =============================================================== */

        .ss-signup-live-card {
          position:
            absolute;

          z-index:
            14;

          display:
            flex;

          align-items:
            center;

          gap:
            9px;

          min-width:
            150px;

          padding:
            10px 12px;

          border:
            1px solid
            rgba(255,255,255,.11);

          border-radius:
            13px;

          background:
            rgba(6,10,15,.59);

          box-shadow:
            0 17px 38px
            rgba(0,0,0,.26);

          backdrop-filter:
            blur(16px);

          -webkit-backdrop-filter:
            blur(16px);

          animation:
            ss-signup-card-float 5.2s
            ease-in-out infinite;
        }

        .ss-signup-live-card.one {
          left:
            31px;

          top:
            138px;
        }

        .ss-signup-live-card.two {
          right:
            32px;

          top:
            173px;

          animation-delay:
            -2s;
        }

        .ss-signup-live-card.three {
          right:
            62px;

          bottom:
            325px;

          animation-delay:
            -3.5s;
        }

        @keyframes ss-signup-card-float {
          0%,
          100% {
            transform:
              translateY(0);
          }

          50% {
            transform:
              translateY(-8px);
          }
        }

        .ss-signup-live-icon {
          width:
            29px;

          height:
            29px;

          flex:
            0 0 29px;

          display:
            grid;

          place-items:
            center;

          border-radius:
            9px;

          background:
            rgba(255,255,255,.065);

          color:
            var(--orange-light);
        }

        .ss-signup-live-card > div:nth-child(2) {
          display:
            flex;

          flex-direction:
            column;

          gap:
            2px;
        }

        .ss-signup-live-card span {
          color:
            rgba(255,255,255,.43);

          font-size:
            8px;

          font-weight:
            750;

          letter-spacing:
            .08em;

          text-transform:
            uppercase;
        }

        .ss-signup-live-card strong {
          color:
            #fff;

          font-size:
            12px;

          font-weight:
            850;
        }

        .ss-signup-live-card > i {
          width:
            5px;

          height:
            5px;

          margin-left:
            auto;

          border-radius:
            50%;

          background:
            #6ddb91;

          box-shadow:
            0 0 10px
            rgba(109,219,145,.70);
        }

        /* ===============================================================
           ROAD
           =============================================================== */

        .ss-signup-road {
          position:
            absolute;

          z-index:
            5;

          left:
            -7%;

          right:
            -7%;

          bottom:
            82px;

          height:
            173px;

          transform:
            perspective(700px)
            rotateX(55deg);

          transform-origin:
            bottom center;

          border-top:
            1px solid
            rgba(255,255,255,.12);

          background:
            linear-gradient(
              180deg,
              rgba(11,14,19,.77),
              rgba(2,5,8,.98)
            );
        }

        .ss-signup-road::before {
          content:
            "";

          position:
            absolute;

          left:
            0;

          right:
            0;

          top:
            50%;

          height:
            3px;

          background:
            repeating-linear-gradient(
              90deg,
              rgba(255,255,255,.35) 0 60px,
              transparent 60px 108px
            );

          animation:
            ss-signup-road-lines
            2.3s
            linear infinite;
        }

        @keyframes ss-signup-road-lines {
          from {
            background-position:
              0 0;
          }

          to {
            background-position:
              -168px 0;
          }
        }

        .ss-signup-route {
          position:
            absolute;

          z-index:
            8;

          left:
            -8%;

          width:
            116%;

          bottom:
            107px;

          height:
            2px;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,80,24,.8) 25%,
              rgba(255,136,78,.95) 52%,
              rgba(255,80,24,.55) 76%,
              transparent
            );

          filter:
            drop-shadow(
              0 0 9px
              rgba(255,75,25,.80)
            );

          animation:
            ss-signup-route
            3.4s
            linear infinite;
        }

        @keyframes ss-signup-route {
          from {
            transform:
              translateX(-160px);
          }

          to {
            transform:
              translateX(160px);
          }
        }

        /* ===============================================================
           TRUCK LAYER
           =============================================================== */

        .ss-signup-truck-layer {
          position:
            absolute;

          z-index:
            10;

          left:
            0;

          right:
            0;

          bottom:
            61px;

          height:
            175px;

          overflow:
            hidden;

          pointer-events:
            none;
        }

        .ss-signup-truck {
          position:
            absolute;

          width:
            172px;

          height:
            87px;

          left:
            -220px;

          transform:
            scale(.76);

          filter:
            drop-shadow(
              0 18px 14px
              rgba(0,0,0,.37)
            );

          animation:
            ss-signup-truck-drive
            12s
            linear infinite;
        }

        .ss-signup-truck.one {
          animation-delay:
            -8s;
        }

        .ss-signup-truck.two {
          transform:
            scale(.58);

          animation-duration:
            8.2s;

          animation-delay:
            -3.5s;
        }

        .ss-signup-truck.three {
          transform:
            scale(.46);

          animation-duration:
            14.7s;

          animation-delay:
            -10s;
        }

        @keyframes ss-signup-truck-drive {
          from {
            left:
              -230px;
          }

          to {
            left:
              calc(100% + 230px);
          }
        }

        .ss-signup-truck-shadow {
          position:
            absolute;

          left:
            12px;

          bottom:
            -1px;

          width:
            150px;

          height:
            15px;

          border-radius:
            50%;

          background:
            rgba(0,0,0,.59);

          filter:
            blur(5px);
        }

        .ss-signup-truck-body {
          position:
            absolute;

          left:
            9px;

          top:
            11px;

          width:
            151px;

          height:
            57px;

          border-radius:
            5px 8px 7px 5px;

          background:
            linear-gradient(
              180deg,
              #2b3744,
              #121923
            );

          border:
            1px solid
            rgba(255,255,255,.11);

          box-shadow:
            inset 0 1px 0
            rgba(255,255,255,.08);
        }

        .ss-signup-trailer {
          position:
            absolute;

          left:
            3px;

          top:
            4px;

          width:
            107px;

          height:
            49px;

          overflow:
            hidden;

          border-radius:
            4px;

          background:
            linear-gradient(
              145deg,
              #36434f,
              #141c25
            );

          border:
            1px solid
            rgba(255,255,255,.075);
        }

        .ss-signup-trailer span {
          position:
            absolute;

          left:
            11px;

          top:
            11px;

          width:
            70px;

          height:
            1px;

          background:
            rgba(255,255,255,.13);
        }

        .ss-signup-trailer span:nth-child(2) {
          top:
            21px;

          width:
            53px;
        }

        .ss-signup-trailer span:nth-child(3) {
          top:
            31px;

          width:
            28px;

          background:
            rgba(255,89,29,.70);
        }

        .ss-signup-truck-cab {
          position:
            absolute;

          right:
            3px;

          top:
            13px;

          width:
            37px;

          height:
            43px;

          border-radius:
            7px 7px 5px 4px;

          background:
            linear-gradient(
              150deg,
              #34414e,
              #141c25
            );

          border:
            1px solid
            rgba(255,255,255,.12);
        }

        .ss-signup-truck-window {
          position:
            absolute;

          left:
            5px;

          top:
            5px;

          width:
            25px;

          height:
            16px;

          border-radius:
            4px 5px 2px 2px;

          background:
            linear-gradient(
              145deg,
              rgba(126,193,224,.66),
              rgba(16,31,45,.84)
            );

          border:
            1px solid
            rgba(255,255,255,.12);
        }

        .ss-signup-truck-light {
          position:
            absolute;

          bottom:
            4px;

          width:
            5px;

          height:
            4px;

          border-radius:
            1px;

          background:
            #ff7044;

          box-shadow:
            0 0 8px
            rgba(255,91,38,.95);
        }

        .ss-signup-truck-light.a {
          left:
            4px;
        }

        .ss-signup-truck-light.b {
          right:
            4px;
        }

        .ss-signup-truck-bumper {
          position:
            absolute;

          right:
            -2px;

          bottom:
            -3px;

          width:
            12px;

          height:
            7px;

          border-radius:
            2px;

          background:
            #070b10;
        }

        .ss-signup-wheel {
          position:
            absolute;

          bottom:
            -11px;

          width:
            25px;

          height:
            25px;

          border-radius:
            50%;

          background:
            radial-gradient(
              circle,
              #727d87 0 16%,
              #11171d 18% 61%,
              #020406 63% 100%
            );

          border:
            2px solid
            #161d25;

          animation:
            ss-signup-wheel
            .55s
            linear infinite;
        }

        .ss-signup-wheel.left {
          left:
            25px;
        }

        .ss-signup-wheel.right {
          right:
            16px;
        }

        .ss-signup-wheel i {
          position:
            absolute;

          inset:
            7px;

          border-radius:
            50%;

          background:
            #8f99a2;
        }

        @keyframes ss-signup-wheel {
          to {
            transform:
              rotate(360deg);
          }
        }

        .ss-signup-truck-label {
          position:
            absolute;

          left:
            45px;

          bottom:
            -37px;

          padding:
            5px 8px;

          border:
            1px solid
            rgba(255,255,255,.10);

          border-radius:
            6px;

          background:
            rgba(5,8,12,.67);

          color:
            rgba(255,255,255,.58);

          font-size:
            8px;

          font-weight:
            800;

          letter-spacing:
            .08em;

          text-transform:
            uppercase;

          white-space:
            nowrap;
        }

        /* ===============================================================
           LIVE TELEMETRY
           =============================================================== */

        .ss-signup-telemetry {
          position:
            absolute;

          z-index:
            17;

          left:
            31px;

          bottom:
            25px;

          display:
            inline-flex;

          align-items:
            center;

          gap:
            8px;

          padding:
            7px 10px;

          border:
            1px solid
            rgba(255,255,255,.09);

          border-radius:
            9px;

          background:
            rgba(5,8,12,.64);

          backdrop-filter:
            blur(12px);

          color:
            rgba(255,255,255,.48);

          font-size:
            8px;

          font-weight:
            800;

          letter-spacing:
            .09em;

          text-transform:
            uppercase;
        }

        .ss-signup-telemetry-dot {
          width:
            5px;

          height:
            5px;

          border-radius:
            50%;

          background:
            var(--orange);

          box-shadow:
            0 0 10px
            rgba(255,82,28,.85);
        }

        /* ===============================================================
           RIGHT PANEL
           =============================================================== */

        .ss-signup-panel {
          position:
            relative;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          min-width:
            0;

          padding:
            42px 57px;

          background:
            linear-gradient(
              145deg,
              #121923,
              #090e15
            );
        }

        .ss-signup-panel-inner {
          width:
            min(440px, 100%);
        }

        /* ===============================================================
           BRAND
           =============================================================== */

        .ss-signup-auth-brand {
          display:
            inline-flex;

          align-items:
            center;

          gap:
            10px;

          margin-bottom:
            30px;
        }

        .ss-signup-auth-logo {
          width:
            38px;

          height:
            38px;

          display:
            grid;

          place-items:
            center;

          border-radius:
            11px;

          background:
            linear-gradient(
              145deg,
              #ff7e4b,
              #d63b0c
            );

          color:
            white;

          font-size:
            16px;

          font-weight:
            950;

          box-shadow:
            0 9px 25px
            rgba(255,79,24,.22);
        }

        .ss-signup-auth-brand-copy {
          display:
            flex;

          flex-direction:
            column;

          gap:
            2px;
        }

        .ss-signup-auth-brand-copy strong {
          color:
            #fff;

          font-size:
            14px;

          font-weight:
            850;
        }

        .ss-signup-auth-brand-copy span {
          color:
            #6f7b89;

          font-size:
            8px;

          font-weight:
            750;

          letter-spacing:
            .11em;

          text-transform:
            uppercase;
        }

        /* ===============================================================
           HEADING
           =============================================================== */

        .ss-signup-heading {
          margin-bottom:
            25px;
        }

        .ss-signup-kicker {
          margin-bottom:
            8px;

          color:
            #778391;

          font-size:
            8px;

          font-weight:
            850;

          letter-spacing:
            .16em;

          text-transform:
            uppercase;
        }

        .ss-signup-heading h1 {
          margin:
            0;

          color:
            #fff;

          font-size:
            clamp(
              29px,
              3vw,
              40px
            );

          line-height:
            1.04;

          letter-spacing:
            -.045em;

          font-weight:
            900;
        }

        .ss-signup-heading p {
          margin:
            9px 0 0;

          color:
            #7e8998;

          font-size:
            11px;

          line-height:
            1.65;
        }

        .ss-signup-protection {
          display:
            inline-flex;

          align-items:
            center;

          gap:
            7px;

          margin-top:
            12px;

          padding:
            6px 8px;

          border:
            1px solid
            rgba(255,255,255,.065);

          border-radius:
            999px;

          background:
            rgba(255,255,255,.025);

          color:
            #7b8795;

          font-size:
            8px;

          font-weight:
            800;

          letter-spacing:
            .05em;

          text-transform:
            uppercase;
        }

        .ss-signup-protection svg {
          color:
            #74d794;
        }

        /* ===============================================================
           FORM
           =============================================================== */

        .ss-signup-form {
          display:
            flex;

          flex-direction:
            column;

          gap:
            13px;
        }

        .ss-signup-group {
          display:
            flex;

          flex-direction:
            column;

          gap:
            7px;
        }

        .ss-signup-label {
          color:
            #afb7c1;

          font-size:
            9px;

          font-weight:
            800;

          letter-spacing:
            .02em;
        }

        .ss-signup-input-wrap {
          position:
            relative;
        }

        .ss-signup-input-icon {
          position:
            absolute;

          left:
            13px;

          top:
            50%;

          display:
            grid;

          place-items:
            center;

          transform:
            translateY(-50%);

          color:
            #5e6a79;

          pointer-events:
            none;

          transition:
            color .2s ease;
        }

        .ss-signup-input-wrap:focus-within
        .ss-signup-input-icon {
          color:
            var(--orange-light);
        }

        .ss-signup-input {
          width:
            100%;

          height:
            44px;

          box-sizing:
            border-box;

          border:
            1px solid
            rgba(255,255,255,.085);

          border-radius:
            11px;

          padding:
            0 13px 0 41px;

          outline:
            none;

          background:
            rgba(255,255,255,.032);

          color:
            #f6f8fa;

          font-family:
            inherit;

          font-size:
            11px;

          transition:
            border-color .2s ease,
            background .2s ease,
            box-shadow .2s ease;
        }

        .ss-signup-input::placeholder {
          color:
            #4d5866;
        }

        .ss-signup-input:hover {
          background:
            rgba(255,255,255,.045);
        }

        .ss-signup-input:focus {
          border-color:
            rgba(255,111,66,.56);

          background:
            rgba(255,255,255,.045);

          box-shadow:
            0 0 0 4px
            rgba(255,87,31,.07);
        }

        .ss-signup-input:disabled {
          opacity:
            .56;

          cursor:
            not-allowed;
        }

        /* ===============================================================
           PASSWORD
           =============================================================== */

        .ss-signup-password-input {
          padding-right:
            47px;
        }

        .ss-signup-eye {
          position:
            absolute;

          right:
            6px;

          top:
            50%;

          width:
            33px;

          height:
            33px;

          display:
            grid;

          place-items:
            center;

          transform:
            translateY(-50%);

          border:
            0;

          border-radius:
            8px;

          background:
            transparent;

          color:
            #677281;

          cursor:
            pointer;

          transition:
            color .2s ease,
            background .2s ease;
        }

        .ss-signup-eye:hover {
          color:
            #fff;

          background:
            rgba(255,255,255,.055);
        }

        /* ===============================================================
           ROLE
           =============================================================== */

        .ss-signup-select-wrap {
          position:
            relative;
        }

        .ss-signup-select {
          appearance:
            none;

          width:
            100%;

          height:
            44px;

          box-sizing:
            border-box;

          border:
            1px solid
            rgba(255,255,255,.085);

          border-radius:
            11px;

          padding:
            0 36px 0 41px;

          background:
            rgba(255,255,255,.032);

          color:
            #e9edf1;

          outline:
            none;

          cursor:
            pointer;

          font-family:
            inherit;

          font-size:
            11px;

          font-weight:
            650;

          transition:
            border-color .2s ease,
            box-shadow .2s ease;
        }

        .ss-signup-select:focus {
          border-color:
            rgba(255,111,66,.56);

          box-shadow:
            0 0 0 4px
            rgba(255,87,31,.07);
        }

        .ss-signup-select option {
          color:
            #171b21;

          background:
            #fff;
        }

        .ss-signup-select-arrow {
          position:
            absolute;

          right:
            13px;

          top:
            50%;

          transform:
            translateY(-50%);

          color:
            #657180;

          pointer-events:
            none;

          font-size:
            11px;
        }

        /* ===============================================================
           ROLE DESCRIPTION
           =============================================================== */

        .ss-signup-role-hint {
          display:
            flex;

          align-items:
            center;

          gap:
            6px;

          margin-top:
            2px;

          color:
            #596574;

          font-size:
            8px;

          line-height:
            1.5;
        }

        .ss-signup-role-hint svg {
          color:
            #7a8795;
        }

        /* ===============================================================
           PASSWORD STATUS
           =============================================================== */

        .ss-signup-password-status {
          display:
            flex;

          flex-direction:
            column;

          gap:
            7px;

          margin-top:
            2px;
        }

        .ss-signup-strength {
          padding:
            8px 9px;

          border:
            1px solid
            rgba(255,255,255,.055);

          border-radius:
            9px;

          background:
            rgba(255,255,255,.018);
        }

        .ss-signup-strength-head {
          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            10px;

          margin-bottom:
            5px;
        }

        .ss-signup-strength-head span {
          color:
            #687483;

          font-size:
            8px;

          font-weight:
            700;
        }

        .ss-signup-strength-head strong {
          color:
            #aeb6c0;

          font-size:
            8px;

          font-weight:
            850;
        }

        .ss-signup-strength-track {
          width:
            100%;

          height:
            4px;

          overflow:
            hidden;

          border-radius:
            999px;

          background:
            rgba(255,255,255,.07);
        }

        .ss-signup-strength-track span {
          display:
            block;

          height:
            100%;

          border-radius:
            inherit;

          background:
            linear-gradient(
              90deg,
              #db4515,
              #ff8d5f
            );

          transition:
            width .25s ease;
        }

        .ss-signup-match {
          display:
            flex;

          align-items:
            center;

          gap:
            6px;

          color:
            #8b6d68;

          font-size:
            8px;

          font-weight:
            700;
        }

        .ss-signup-match.good {
          color:
            #72c68a;
        }

        .ss-signup-match > span {
          display:
            grid;

          place-items:
            center;

          width:
            16px;

          height:
            16px;

          border-radius:
            50%;

          background:
            rgba(255,255,255,.045);

          font-size:
            9px;

          font-weight:
            900;
        }

        /* ===============================================================
           ERROR
           =============================================================== */

        .ss-signup-error {
          display:
            flex;

          align-items:
            flex-start;

          gap:
            8px;

          padding:
            9px 10px;

          border:
            1px solid
            rgba(239,112,92,.18);

          border-radius:
            10px;

          background:
            rgba(239,112,92,.065);

          color:
            #ef9a87;

          font-size:
            9px;

          line-height:
            1.5;

          font-weight:
            700;
        }

        .ss-signup-error-dot {
          width:
            6px;

          height:
            6px;

          flex:
            0 0 6px;

          margin-top:
            3px;

          border-radius:
            50%;

          background:
            #ef705c;
        }

        /* ===============================================================
           SUBMIT
           =============================================================== */

        .ss-signup-submit {
          position:
            relative;

          width:
            100%;

          height:
            45px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          gap:
            8px;

          overflow:
            hidden;

          border:
            0;

          border-radius:
            11px;

          background:
            linear-gradient(
              135deg,
              #ff743e,
              #df430f
            );

          color:
            white;

          cursor:
            pointer;

          font-family:
            inherit;

          font-size:
            10px;

          font-weight:
            850;

          box-shadow:
            0 14px 28px
            rgba(224,67,15,.17);

          transition:
            transform .2s ease,
            box-shadow .2s ease,
            opacity .2s ease;
        }

        .ss-signup-submit::before {
          content:
            "";

          position:
            absolute;

          left:
            -45%;

          top:
            0;

          width:
            34%;

          height:
            100%;

          transform:
            skewX(-20deg);

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.23),
              transparent
            );

          transition:
            left .55s ease;
        }

        .ss-signup-submit:hover::before {
          left:
            120%;
        }

        .ss-signup-submit:hover {
          transform:
            translateY(-2px);

          box-shadow:
            0 18px 34px
            rgba(224,67,15,.24);
        }

        .ss-signup-submit:active {
          transform:
            translateY(0);
        }

        .ss-signup-submit:disabled {
          opacity:
            .55;

          cursor:
            not-allowed;

          transform:
            none;

          box-shadow:
            none;
        }

        .ss-signup-spinner {
          width:
            14px;

          height:
            14px;

          border:
            2px solid
            rgba(255,255,255,.32);

          border-top-color:
            #fff;

          border-radius:
            50%;

          animation:
            ss-signup-spin .7s linear infinite;
        }

        @keyframes ss-signup-spin {
          to {
            transform:
              rotate(360deg);
          }
        }

        /* ===============================================================
           DIVIDER
           =============================================================== */

        .ss-signup-divider {
          display:
            flex;

          align-items:
            center;

          gap:
            10px;

          margin:
            17px 0;
        }

        .ss-signup-divider span {
          flex:
            1;

          height:
            1px;

          background:
            rgba(255,255,255,.075);
        }

        .ss-signup-divider p {
          margin:
            0;

          color:
            #596473;

          font-size:
            8px;

          font-weight:
            850;

          letter-spacing:
            .13em;
        }

        /* ===============================================================
           GOOGLE
           =============================================================== */

        .ss-signup-google {
          position:
            relative;

          width:
            100%;

          min-height:
            44px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          overflow:
            hidden;

          border-radius:
            11px;
        }

        .ss-signup-google > div {
          width:
            100% !important;

          display:
            flex;

          justify-content:
            center;
        }

        /* ===============================================================
           LOGIN FOOTER
           =============================================================== */

        .ss-signup-footer {
          margin:
            19px 0 0;

          text-align:
            center;

          color:
            #687382;

          font-size:
            9px;

          line-height:
            1.55;
        }

        .ss-signup-footer a {
          color:
            #eef1f4;

          text-decoration:
            none;

          font-weight:
            800;

          transition:
            color .2s ease;
        }

        .ss-signup-footer a:hover {
          color:
            #ff8557;
        }

        /* ===============================================================
           TRUST
           =============================================================== */

        .ss-signup-trust {
          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          gap:
            11px;

          margin-top:
            19px;

          padding-top:
            15px;

          border-top:
            1px solid
            rgba(255,255,255,.055);

          color:
            #4f5b69;

          font-size:
            7px;

          font-weight:
            750;

          letter-spacing:
            .06em;

          text-transform:
            uppercase;
        }

        .ss-signup-trust-item {
          display:
            inline-flex;

          align-items:
            center;

          gap:
            4px;
        }

        .ss-signup-trust-item svg {
          color:
            #667381;
        }

        .ss-signup-trust-dot {
          width:
            3px;

          height:
            3px;

          border-radius:
            50%;

          background:
            #3e4956;
        }

        /* ===============================================================
           RESPONSIVE
           =============================================================== */

        @media (max-width: 1150px) {
          .ss-signup-shell {
            grid-template-columns:
              minmax(0, 1fr)
              minmax(400px, .8fr);

            min-height:
              740px;
          }

          .ss-signup-visual-copy {
            left:
              38px;

            bottom:
              205px;
          }

          .ss-signup-panel {
            padding:
              38px;
          }
        }

        @media (max-width: 910px) {
          .ss-signup-page {
            padding:
              15px;
          }

          .ss-signup-shell {
            grid-template-columns:
              1fr;

            max-width:
              570px;

            min-height:
              auto;
          }

          .ss-signup-visual {
            min-height:
              365px;

            border-right:
              0;

            border-bottom:
              1px solid
              rgba(255,255,255,.075);
          }

          .ss-signup-visual-copy {
            left:
              28px;

            right:
              28px;

            bottom:
              70px;
          }

          .ss-signup-visual-copy h2 {
            font-size:
              clamp(
                31px,
                7vw,
                44px
              );
          }

          .ss-signup-live-card.one {
            left:
              18px;

            top:
              94px;
          }

          .ss-signup-live-card.two {
            right:
              18px;

            top:
              106px;
          }

          .ss-signup-live-card.three {
            right:
              25px;

            bottom:
              117px;
          }

          .ss-signup-road {
            bottom:
              38px;
          }

          .ss-signup-truck-layer {
            bottom:
              22px;
          }

          .ss-signup-telemetry {
            bottom:
              15px;

            left:
              18px;
          }

          .ss-signup-panel {
            padding:
              42px 35px 35px;
          }
        }

        @media (max-width: 600px) {
          .ss-signup-page {
            padding:
              0;

            align-items:
              stretch;
          }

          .ss-signup-shell {
            width:
              100%;

            min-height:
              100vh;

            border:
              0;

            border-radius:
              0;
          }

          .ss-signup-visual {
            min-height:
              280px;
          }

          .ss-signup-topbar {
            top:
              16px;

            left:
              16px;

            right:
              16px;
          }

          .ss-signup-status {
            display:
              none;
          }

          .ss-signup-live-card.two,
          .ss-signup-live-card.three {
            display:
              none;
          }

          .ss-signup-live-card.one {
            left:
              17px;

            top:
              74px;
          }

          .ss-signup-visual-copy {
            left:
              20px;

            right:
              20px;

            bottom:
              43px;
          }

          .ss-signup-visual-copy p {
            display:
              none;
          }

          .ss-signup-panel {
            align-items:
              flex-start;

            padding:
              31px 21px 27px;
          }

          .ss-signup-auth-brand {
            margin-bottom:
              26px;
          }

          .ss-signup-heading {
            margin-bottom:
              22px;
          }

          .ss-signup-heading h1 {
            font-size:
              31px;
          }

          .ss-signup-form {
            gap:
              12px;
          }

          .ss-signup-trust {
            gap:
              7px;

            font-size:
              6px;
          }
        }

        /* ===============================================================
           REDUCED MOTION
           =============================================================== */

        @media (prefers-reduced-motion: reduce) {
          .ss-signup-glow,
          .ss-signup-status-dot,
          .ss-signup-live-card,
          .ss-signup-truck,
          .ss-signup-wheel,
          .ss-signup-route,
          .ss-signup-road::before,
          .ss-signup-submit::before,
          .ss-signup-spinner {
            animation:
              none !important;
          }

          .ss-signup-input,
          .ss-signup-submit,
          .ss-signup-eye,
          .ss-signup-footer a {
            transition:
              none !important;
          }
        }
      `}</style>

      {/* ==================================================================
          PAGE
          ================================================================== */}

      <main className="ss-signup-page">
        <div
          className="ss-signup-grid"
          aria-hidden="true"
        />

        <div
          className="ss-signup-glow a"
          aria-hidden="true"
        />

        <div
          className="ss-signup-glow b"
          aria-hidden="true"
        />

        {/* ==================================================================
            MAIN SHELL
            ================================================================== */}

        <section className="ss-signup-shell">
          {/* ================================================================
              LEFT SIDE — LOGISTICS VISUALIZATION
              ================================================================ */}

          <section className="ss-signup-visual">
            <div
              className="ss-signup-vignette"
              aria-hidden="true"
            />

            {/* Top */}

            <div className="ss-signup-topbar">
              <div className="ss-signup-brand-pill">
                <div className="ss-signup-brand-mark">
                  S
                </div>

                <span>
                  StockSense
                </span>
              </div>

              <div className="ss-signup-status">
                <span className="ss-signup-status-dot" />

                Logistics network online
              </div>
            </div>

            {/* Live inventory */}

            <LiveDataCard
              className="one"
              icon={BoxesIcon}
              title="Inventory"
              value="24,816 units"
            />

            <LiveDataCard
              className="two"
              icon={TruckIcon}
              title="Active fleet"
              value="128 routes"
            />

            <LiveDataCard
              className="three"
              icon={WarehouseIcon}
              title="Warehouses"
              value="18 connected"
            />

            {/* Visual copy */}

            <div className="ss-signup-visual-copy">
              <div className="ss-signup-eyebrow">
                <span className="ss-signup-eyebrow-line" />

                Smart inventory operations
              </div>

              <h2>
                Build your
                <br />

                <span>
                  inventory command center.
                </span>
              </h2>

              <p>
                Create your StockSense account
                and bring products, warehouses,
                stock movements and logistics
                into one intelligent workspace.
              </p>
            </div>

            {/* Road */}

            <div
              className="ss-signup-road"
              aria-hidden="true"
            />

            <div
              className="ss-signup-route"
              aria-hidden="true"
            />

            {/* Trucks */}

            <div
              className="ss-signup-truck-layer"
              aria-hidden="true"
            >
              <MovingTruck
                className="one"
                label="Inbound"
              />

              <MovingTruck
                className="two"
                label="Dispatch"
              />

              <MovingTruck
                className="three"
                label="Transfer"
              />
            </div>

            {/* Telemetry */}

            <div className="ss-signup-telemetry">
              <span className="ss-signup-telemetry-dot" />

              LIVE INVENTORY TELEMETRY

              <span>•</span>

              24/7 MONITORING
            </div>
          </section>

          {/* ================================================================
              RIGHT SIDE — CREATE ACCOUNT
              ================================================================ */}

          <section className="ss-signup-panel">
            <div className="ss-signup-panel-inner">
              {/* Brand */}

              <div className="ss-signup-auth-brand">
                <div className="ss-signup-auth-logo">
                  S
                </div>

                <div className="ss-signup-auth-brand-copy">
                  <strong>
                    StockSense
                  </strong>

                  <span>
                    Inventory management
                  </span>
                </div>
              </div>

              {/* Heading */}

              <div className="ss-signup-heading">
                <div className="ss-signup-kicker">
                  Workspace onboarding
                </div>

                <h1>
                  Create your
                  account.
                </h1>

                <p>
                  Set up your account and
                  start managing inventory
                  with StockSense.
                </p>

                <div className="ss-signup-protection">
                  <ShieldIcon size={12} />

                  Secure account creation
                </div>
              </div>

              {/* ============================================================
                  FORM
                  ============================================================ */}

              <form
                onSubmit={handleSubmit}
                className="ss-signup-form"
                noValidate
              >
                {/* ==========================================================
                    NAME
                    ========================================================== */}

                <div className="ss-signup-group">
                  <label
                    className="ss-signup-label"
                    htmlFor="name"
                  >
                    Full name
                  </label>

                  <div className="ss-signup-input-wrap">
                    <span
                      className="ss-signup-input-icon"
                      aria-hidden="true"
                    >
                      <UserIcon
                        size={16}
                      />
                    </span>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="e.g. Alex Morgan"
                      value={
                        form.name
                      }
                      onChange={
                        handleChange
                      }
                      onFocus={() =>
                        setFocusedField(
                          "name"
                        )
                      }
                      onBlur={() =>
                        setFocusedField("")
                      }
                      disabled={loading}
                      required
                      className="ss-signup-input"
                    />
                  </div>
                </div>

                {/* ==========================================================
                    EMAIL
                    ========================================================== */}

                <div className="ss-signup-group">
                  <label
                    className="ss-signup-label"
                    htmlFor="email"
                  >
                    Email address
                  </label>

                  <div className="ss-signup-input-wrap">
                    <span
                      className="ss-signup-input-icon"
                      aria-hidden="true"
                    >
                      <MailIcon
                        size={16}
                      />
                    </span>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      value={
                        form.email
                      }
                      onChange={
                        handleChange
                      }
                      onFocus={() =>
                        setFocusedField(
                          "email"
                        )
                      }
                      onBlur={() =>
                        setFocusedField("")
                      }
                      disabled={loading}
                      required
                      className="ss-signup-input"
                    />
                  </div>

                  {form.email &&
                    !validEmail && (
                      <span
                        style={{
                          color:
                            "#a17a72",
                          fontSize:
                            "8px",
                          fontWeight:
                            700,
                        }}
                      >
                        Enter a valid
                        email address.
                      </span>
                    )}
                </div>

                {/* ==========================================================
                    ROLE
                    ========================================================== */}

                <div className="ss-signup-group">
                  <label
                    className="ss-signup-label"
                    htmlFor="role"
                  >
                    Workspace role
                  </label>

                  <div className="ss-signup-select-wrap">
                    <span
                      className="ss-signup-input-icon"
                      aria-hidden="true"
                    >
                      <WarehouseIcon
                        size={16}
                      />
                    </span>

                    <select
                      id="role"
                      name="role"
                      value={
                        form.role
                      }
                      onChange={
                        handleChange
                      }
                      disabled={loading}
                      className="ss-signup-select"
                    >
                      <option value="warehouse_staff">
                        Warehouse Staff
                      </option>

                      <option value="inventory_manager">
                        Inventory Manager
                      </option>
                    </select>

                    <span className="ss-signup-select-arrow">
                      ▾
                    </span>
                  </div>

                  <div className="ss-signup-role-hint">
                    <ShieldIcon
                      size={11}
                    />

                    Your role controls
                    the workspace
                    capabilities available
                    to you.
                  </div>
                </div>

                {/* ==========================================================
                    PASSWORD
                    ========================================================== */}

                <div className="ss-signup-group">
                  <label
                    className="ss-signup-label"
                    htmlFor="password"
                  >
                    Password
                  </label>

                  <div className="ss-signup-input-wrap">
                    <span
                      className="ss-signup-input-icon"
                      aria-hidden="true"
                    >
                      <LockIcon
                        size={16}
                      />
                    </span>

                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      value={
                        form.password
                      }
                      onChange={
                        handleChange
                      }
                      disabled={loading}
                      required
                      className="ss-signup-input ss-signup-password-input"
                    />

                    <button
                      type="button"
                      className="ss-signup-eye"
                      onClick={() =>
                        setShowPassword(
                          (prev) =>
                            !prev
                        )
                      }
                      disabled={loading}
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      <EyeIcon
                        open={
                          showPassword
                        }
                        size={16}
                      />
                    </button>
                  </div>
                </div>

                {/* ==========================================================
                    CONFIRM PASSWORD
                    ========================================================== */}

                <div className="ss-signup-group">
                  <label
                    className="ss-signup-label"
                    htmlFor="confirmPassword"
                  >
                    Confirm password
                  </label>

                  <div className="ss-signup-input-wrap">
                    <span
                      className="ss-signup-input-icon"
                      aria-hidden="true"
                    >
                      <LockIcon
                        size={16}
                      />
                    </span>

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      placeholder="Re-enter password"
                      value={
                        form.confirmPassword
                      }
                      onChange={
                        handleChange
                      }
                      disabled={loading}
                      required
                      className="ss-signup-input ss-signup-password-input"
                    />

                    <button
                      type="button"
                      className="ss-signup-eye"
                      onClick={() =>
                        setShowConfirmPassword(
                          (prev) =>
                            !prev
                        )
                      }
                      disabled={loading}
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      <EyeIcon
                        open={
                          showConfirmPassword
                        }
                        size={16}
                      />
                    </button>
                  </div>

                  <PasswordStatus
                    password={
                      form.password
                    }
                    confirmPassword={
                      form.confirmPassword
                    }
                  />
                </div>

                {/* ==========================================================
                    ERROR
                    ========================================================== */}

                {error && (
                  <div
                    className="ss-signup-error"
                    role="alert"
                  >
                    <span className="ss-signup-error-dot" />

                    <span>
                      {error}
                    </span>
                  </div>
                )}

                {/* ==========================================================
                    SUBMIT
                    ========================================================== */}

                <button
                  type="submit"
                  className="ss-signup-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner />

                      Creating account...
                    </>
                  ) : (
                    <>
                      Create StockSense
                      account

                      <ArrowRightIcon
                        size={16}
                      />
                    </>
                  )}
                </button>
              </form>

              {/* ============================================================
                  GOOGLE
                  ============================================================ */}

              <div className="ss-signup-divider">
                <span />

                <p>
                  OR
                </p>

                <span />
              </div>

              <div className="ss-signup-google">
                <GoogleLogin
                  onSuccess={
                    handleGoogleSuccess
                  }
                  onError={() =>
                    setError(
                      "Google sign-in was unsuccessful. Please try again."
                    )
                  }
                  theme="outline"
                  size="large"
                  width="100%"
                  text="signup_with"
                />
              </div>

              {/* ============================================================
                  LOGIN
                  ============================================================ */}

              <p className="ss-signup-footer">
                Already have an account?{" "}

                <Link to="/login">
                  Sign in
                </Link>
              </p>

              {/* ============================================================
                  TRUST
                  ============================================================ */}

              <div className="ss-signup-trust">
                <span className="ss-signup-trust-item">
                  <ShieldIcon
                    size={10}
                  />

                  Secure account
                </span>

                <span className="ss-signup-trust-dot" />

                <span className="ss-signup-trust-item">
                  <LockIcon
                    size={10}
                  />

                  Protected session
                </span>

                <span className="ss-signup-trust-dot" />

                <span className="ss-signup-trust-item">
                  StockSense
                </span>
              </div>
            </div>
          </section>
        </section>
      </main>
    </>
  );
}
