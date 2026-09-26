import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { loginUser } from "../services/authservice";
import { apiRequest } from "../services/api";

/* ================================================================
   STOCKSENSE
   ULTRA LOGIN EXPERIENCE
   ---------------------------------------------------------------
   Frontend-only visual enhancement.
   Existing authentication flow intentionally preserved.
   No new dependencies required.
   ================================================================ */

/* ----------------------------------------------------------------
   ICONS
   ---------------------------------------------------------------- */

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

function EyeIcon({ open, size = 18 }) {
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

function ActivityIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 12h4l2.2-5.5L13 17l2.4-7 1.7 2H21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
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

/* ----------------------------------------------------------------
   LOADING SPINNER
   ---------------------------------------------------------------- */

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="ss-login-spinner"
    />
  );
}

/* ----------------------------------------------------------------
   3D CSS TRUCK
   ---------------------------------------------------------------- */

function MovingTruck({
  className = "",
  label = "",
}) {
  return (
    <div
      className={`ss-truck-unit ${className}`}
    >
      <div className="ss-truck-shadow" />

      <div className="ss-truck-body">
        <div className="ss-truck-container">
          <span className="ss-truck-container-line" />
          <span className="ss-truck-container-line short" />
          <span className="ss-truck-container-line tiny" />
        </div>

        <div className="ss-truck-cab">
          <div className="ss-truck-window" />
          <div className="ss-truck-window-glow" />

          <div className="ss-truck-light left" />
          <div className="ss-truck-light right" />
        </div>

        <div className="ss-truck-bumper" />
      </div>

      <div className="ss-truck-wheel front">
        <span />
      </div>

      <div className="ss-truck-wheel rear">
        <span />
      </div>

      {label && (
        <div className="ss-truck-label">
          {label}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------
   FLOATING INVENTORY CARD
   ---------------------------------------------------------------- */

function InventoryFloatCard({
  type,
  title,
  value,
  icon: Icon,
}) {
  return (
    <div
      className={`ss-float-card ${type}`}
    >
      <div className="ss-float-card-icon">
        <Icon size={15} />
      </div>

      <div className="ss-float-card-copy">
        <span>{title}</span>
        <strong>{value}</strong>
      </div>

      <span className="ss-float-pulse" />
    </div>
  );
}

/* ----------------------------------------------------------------
   MAIN LOGIN
   ---------------------------------------------------------------- */

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

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

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      !form.email.trim() ||
      !form.password
    ) {
      setError(
        "Please enter your email and password."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      const data =
        await loginUser(
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

      const data =
        await apiRequest(
          "/auth/google",
          {
            method: "POST",
            body: JSON.stringify({
              id_token:
                googleIdToken,
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
    <>
      <style>{`
        /* ============================================================
           PAGE
           ============================================================ */

        .ss-login-page {
          --ss-bg: #070b11;
          --ss-panel: #0c1119;
          --ss-panel-soft: #111925;
          --ss-border: rgba(255,255,255,.09);
          --ss-text: #f5f7fa;
          --ss-muted: #8f9aaa;
          --ss-orange: #ff5a20;
          --ss-orange-soft: #ff8a54;
          --ss-danger: #ef705c;

          position: relative;
          min-height: 100vh;
          width: 100%;
          overflow: hidden;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 28px;

          background:
            radial-gradient(
              circle at 10% 20%,
              rgba(255,70,22,.10),
              transparent 25%
            ),
            radial-gradient(
              circle at 90% 80%,
              rgba(255,92,30,.08),
              transparent 26%
            ),
            #070b11;

          color: var(--ss-text);

          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        /* ============================================================
           AMBIENT BACKGROUND
           ============================================================ */

        .ss-login-grid {
          position: absolute;
          inset: 0;

          opacity: .16;

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
            42px 42px;

          mask-image:
            linear-gradient(
              to bottom,
              transparent,
              black 18%,
              black 82%,
              transparent
            );

          pointer-events: none;
        }

        .ss-login-noise {
          position: absolute;
          inset: 0;

          opacity: .035;

          background-image:
            url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E");

          pointer-events: none;
        }

        .ss-login-glow {
          position: absolute;

          width: 430px;
          height: 430px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(255,82,27,.13),
              transparent 70%
            );

          filter: blur(15px);

          pointer-events: none;

          animation:
            ss-glow-breathe 7s ease-in-out infinite;
        }

        .ss-login-glow.one {
          left: -160px;
          top: -130px;
        }

        .ss-login-glow.two {
          right: -180px;
          bottom: -160px;

          animation-delay: -3s;
        }

        @keyframes ss-glow-breathe {
          0%,
          100% {
            transform: scale(1);
            opacity: .7;
          }

          50% {
            transform: scale(1.14);
            opacity: 1;
          }
        }

        /* ============================================================
           MAIN SHELL
           ============================================================ */

        .ss-login-shell {
          position: relative;
          z-index: 5;

          display: grid;

          grid-template-columns:
            minmax(0, 1.12fr)
            minmax(410px, .88fr);

          width: min(
            1420px,
            100%
          );

          min-height: 770px;

          overflow: hidden;

          border:
            1px solid
            rgba(255,255,255,.10);

          border-radius: 30px;

          background:
            rgba(11,16,23,.87);

          box-shadow:
            0 40px 120px rgba(0,0,0,.54),
            inset 0 1px 0 rgba(255,255,255,.035);

          backdrop-filter:
            blur(28px);

          -webkit-backdrop-filter:
            blur(28px);
        }

        /* ============================================================
           VISUAL SIDE
           ============================================================ */

        .ss-login-visual {
          position: relative;
          overflow: hidden;

          min-width: 0;

          background:
            linear-gradient(
              90deg,
              rgba(6,9,14,.30),
              rgba(6,9,14,.02)
            ),
            linear-gradient(
              180deg,
              rgba(3,7,12,.08),
              rgba(3,7,12,.50)
            ),
            url("/images/stocksense-warehouse.png")
            center center /
            cover
            no-repeat;

          border-right:
            1px solid
            rgba(255,255,255,.07);
        }

        .ss-login-visual::after {
          content: "";

          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              90deg,
              rgba(5,8,12,.72) 0%,
              rgba(5,8,12,.34) 40%,
              transparent 78%
            );

          pointer-events: none;
        }

        .ss-visual-vignette {
          position: absolute;
          inset: 0;

          background:
            radial-gradient(
              circle at 54% 48%,
              transparent 18%,
              rgba(5,8,12,.22) 60%,
              rgba(5,8,12,.70) 100%
            );

          z-index: 1;

          pointer-events: none;
        }

        /* ============================================================
           VISUAL TOP BAR
           ============================================================ */

        .ss-visual-topbar {
          position: absolute;

          top: 26px;
          left: 27px;
          right: 27px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          z-index: 10;
        }

        .ss-brand-chip {
          display: inline-flex;
          align-items: center;
          gap: 10px;

          padding:
            8px 12px;

          border:
            1px solid
            rgba(255,255,255,.12);

          border-radius: 12px;

          background:
            rgba(0,0,0,.21);

          backdrop-filter:
            blur(14px);

          color: #fff;
        }

        .ss-brand-mini {
          display: grid;
          place-items: center;

          width: 27px;
          height: 27px;

          border-radius: 8px;

          background:
            linear-gradient(
              145deg,
              #ff783f,
              #d52f08
            );

          color: #fff;

          font-weight: 950;

          font-size: 12px;

          box-shadow:
            0 0 22px
            rgba(255,87,30,.32);
        }

        .ss-brand-chip span {
          font-size: 10px;

          font-weight: 800;

          letter-spacing:
            .10em;

          text-transform:
            uppercase;

          color:
            rgba(255,255,255,.72);
        }

        .ss-system-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;

          padding:
            8px 11px;

          border:
            1px solid
            rgba(255,255,255,.11);

          border-radius: 999px;

          background:
            rgba(0,0,0,.20);

          backdrop-filter:
            blur(14px);

          font-size: 9px;

          font-weight: 800;

          letter-spacing:
            .08em;

          text-transform:
            uppercase;

          color:
            rgba(255,255,255,.64);
        }

        .ss-status-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #69df8b;

          box-shadow:
            0 0 0 4px
            rgba(105,223,139,.10),
            0 0 14px
            rgba(105,223,139,.55);

          animation:
            ss-status-pulse 2.3s ease-in-out infinite;
        }

        @keyframes ss-status-pulse {
          0%,
          100% {
            opacity: .55;
          }

          50% {
            opacity: 1;
          }
        }

        /* ============================================================
           VISUAL COPY
           ============================================================ */

        .ss-visual-copy {
          position: absolute;

          left: 52px;
          right: 52px;
          bottom: 212px;

          z-index: 10;
        }

        .ss-visual-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;

          margin-bottom: 13px;

          color:
            rgba(255,255,255,.62);

          font-size: 10px;

          font-weight: 850;

          letter-spacing:
            .18em;

          text-transform:
            uppercase;
        }

        .ss-visual-eyebrow-line {
          width: 31px;
          height: 1px;

          background:
            linear-gradient(
              90deg,
              var(--ss-orange),
              transparent
            );
        }

        .ss-visual-copy h2 {
          max-width: 650px;

          margin: 0;

          font-size:
            clamp(
              34px,
              4.1vw,
              62px
            );

          line-height:
            .98;

          letter-spacing:
            -.055em;

          font-weight: 880;

          color: #fff;

          text-shadow:
            0 10px 35px
            rgba(0,0,0,.44);
        }

        .ss-visual-copy h2 span {
          color:
            var(--ss-orange-soft);
        }

        .ss-visual-copy p {
          max-width: 570px;

          margin:
            17px 0 0;

          color:
            rgba(255,255,255,.64);

          font-size: 12px;

          line-height:
            1.7;
        }

        /* ============================================================
           FLOATING DATA CARDS
           ============================================================ */

        .ss-float-card {
          position: absolute;

          z-index: 12;

          display: flex;
          align-items: center;
          gap: 9px;

          min-width: 145px;

          padding:
            10px 12px;

          border:
            1px solid
            rgba(255,255,255,.12);

          border-radius: 13px;

          background:
            rgba(9,13,19,.58);

          box-shadow:
            0 15px 35px
            rgba(0,0,0,.28);

          backdrop-filter:
            blur(16px);

          -webkit-backdrop-filter:
            blur(16px);

          animation:
            ss-float 5s
            ease-in-out infinite;
        }

        .ss-float-card.one {
          left: 36px;
          top: 140px;
        }

        .ss-float-card.two {
          right: 34px;
          top: 190px;

          animation-delay:
            -2.2s;
        }

        .ss-float-card.three {
          right: 72px;
          bottom: 315px;

          animation-delay:
            -3.5s;
        }

        @keyframes ss-float {
          0%,
          100% {
            transform:
              translateY(0px);
          }

          50% {
            transform:
              translateY(-9px);
          }
        }

        .ss-float-card-icon {
          display: grid;
          place-items: center;

          width: 29px;
          height: 29px;

          flex: 0 0 29px;

          border-radius: 9px;

          background:
            rgba(255,255,255,.07);

          color:
            var(--ss-orange-soft);
        }

        .ss-float-card-copy {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .ss-float-card-copy span {
          color:
            rgba(255,255,255,.45);

          font-size: 8px;

          font-weight: 750;

          letter-spacing:
            .08em;

          text-transform:
            uppercase;
        }

        .ss-float-card-copy strong {
          color: #fff;

          font-size: 13px;

          font-weight: 850;
        }

        .ss-float-pulse {
          width: 5px;
          height: 5px;

          margin-left: auto;

          border-radius: 50%;

          background:
            #70df91;

          box-shadow:
            0 0 10px
            rgba(112,223,145,.65);
        }

        /* ============================================================
           LIVE ROAD
           ============================================================ */

        .ss-road {
          position: absolute;

          left: -8%;
          right: -8%;
          bottom: 88px;

          height: 170px;

          z-index: 5;

          transform:
            perspective(700px)
            rotateX(55deg);

          transform-origin:
            bottom center;

          border-top:
            1px solid
            rgba(255,255,255,.13);

          background:
            linear-gradient(
              180deg,
              rgba(10,13,18,.82),
              rgba(3,6,10,.96)
            );

          box-shadow:
            0 -22px 50px
            rgba(0,0,0,.30);
        }

        .ss-road::before {
          content: "";

          position: absolute;
          left: 0;
          right: 0;
          top: 50%;

          height: 4px;

          background:
            repeating-linear-gradient(
              90deg,
              rgba(255,255,255,.35) 0 60px,
              transparent 60px 110px
            );

          animation:
            ss-road-lines 2.2s
            linear infinite;
        }

        @keyframes ss-road-lines {
          from {
            background-position:
              0 0;
          }

          to {
            background-position:
              -170px 0;
          }
        }

        .ss-route-line {
          position: absolute;

          bottom: 112px;

          left: -10%;

          width: 120%;

          height: 2px;

          z-index: 8;

          background:
            linear-gradient(
              90deg,
              transparent 0%,
              rgba(255,85,31,.06) 8%,
              rgba(255,85,31,.85) 28%,
              rgba(255,137,86,.9) 53%,
              rgba(255,85,31,.54) 73%,
              transparent 100%
            );

          filter:
            drop-shadow(
              0 0 8px
              rgba(255,77,25,.7)
            );

          animation:
            ss-route-flow 3s
            linear infinite;
        }

        @keyframes ss-route-flow {
          from {
            transform:
              translateX(-140px);
          }

          to {
            transform:
              translateX(140px);
          }
        }

        /* ============================================================
           TRUCKS
           ============================================================ */

        .ss-truck-layer {
          position: absolute;

          left: 0;
          right: 0;
          bottom: 68px;

          height: 175px;

          z-index: 9;

          overflow: hidden;

          pointer-events: none;
        }

        .ss-truck-unit {
          position: absolute;

          width: 160px;
          height: 82px;

          transform:
            translateX(-230px)
            scale(.78);

          filter:
            drop-shadow(
              0 18px 12px
              rgba(0,0,0,.38)
            );

          animation:
            ss-truck-drive
            12s
            linear infinite;
        }

        .ss-truck-unit.fast {
          animation-duration:
            8s;

          animation-delay:
            -4s;

          transform:
            translateX(-230px)
            scale(.61);
        }

        .ss-truck-unit.reverse {
          animation-duration:
            15s;

          animation-delay:
            -7s;

          transform:
            translateX(100vw)
            scale(.50);
        }

        .ss-truck-unit.hero {
          animation-duration:
            16s;

          animation-delay:
            -11s;

          transform:
            translateX(-250px)
            scale(1.05);
        }

        @keyframes ss-truck-drive {
          0% {
            left: -190px;
          }

          100% {
            left: calc(100% + 190px);
          }
        }

        .ss-truck-shadow {
          position: absolute;

          left: 12px;
          bottom: -2px;

          width: 144px;
          height: 16px;

          border-radius: 50%;

          background:
            rgba(0,0,0,.58);

          filter:
            blur(5px);
        }

        .ss-truck-body {
          position: absolute;

          left: 8px;
          top: 10px;

          width: 146px;
          height: 56px;

          border-radius:
            5px 8px 7px 5px;

          transform:
            skewY(-1deg);

          background:
            linear-gradient(
              180deg,
              #26313d,
              #121923
            );

          border:
            1px solid
            rgba(255,255,255,.11);

          box-shadow:
            inset 0 1px 0
            rgba(255,255,255,.08);
        }

        .ss-truck-container {
          position: absolute;

          left: 3px;
          top: 4px;

          width: 104px;
          height: 48px;

          overflow: hidden;

          border-radius: 4px;

          background:
            linear-gradient(
              145deg,
              #33404e,
              #161f29 72%
            );

          border:
            1px solid
            rgba(255,255,255,.08);
        }

        .ss-truck-container-line {
          position: absolute;

          left: 10px;
          top: 11px;

          width: 72px;
          height: 1px;

          background:
            rgba(255,255,255,.13);
        }

        .ss-truck-container-line.short {
          top: 21px;
          width: 52px;
        }

        .ss-truck-container-line.tiny {
          top: 31px;
          width: 28px;

          background:
            rgba(255,93,32,.65);
        }

        .ss-truck-cab {
          position: absolute;

          right: 3px;
          top: 13px;

          width: 36px;
          height: 43px;

          border-radius:
            7px 7px 5px 4px;

          background:
            linear-gradient(
              150deg,
              #303d4a,
              #151d26
            );

          border:
            1px solid
            rgba(255,255,255,.12);
        }

        .ss-truck-window {
          position: absolute;

          left: 5px;
          top: 5px;

          width: 24px;
          height: 16px;

          border-radius:
            4px 5px 2px 2px;

          background:
            linear-gradient(
              145deg,
              rgba(126,190,224,.62),
              rgba(17,31,44,.82)
            );

          border:
            1px solid
            rgba(255,255,255,.14);
        }

        .ss-truck-window-glow {
          position: absolute;

          left: 7px;
          top: 7px;

          width: 9px;
          height: 2px;

          border-radius: 99px;

          background:
            rgba(255,255,255,.25);
        }

        .ss-truck-light {
          position: absolute;

          bottom: 4px;

          width: 5px;
          height: 4px;

          border-radius: 1px;

          background:
            #ff7043;

          box-shadow:
            0 0 7px
            rgba(255,91,38,.95);
        }

        .ss-truck-light.left {
          left: 4px;
        }

        .ss-truck-light.right {
          right: 4px;
        }

        .ss-truck-bumper {
          position: absolute;

          right: -2px;
          bottom: -3px;

          width: 11px;
          height: 7px;

          border-radius: 2px;

          background:
            #0a0e13;
        }

        .ss-truck-wheel {
          position: absolute;

          bottom: -11px;

          width: 24px;
          height: 24px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              #67717b 0 18%,
              #11161c 20% 62%,
              #030507 63% 100%
            );

          border:
            2px solid
            #161c23;

          box-shadow:
            0 2px 0
            rgba(255,255,255,.05);
        }

        .ss-truck-wheel.front {
          right: 16px;
        }

        .ss-truck-wheel.rear {
          left: 25px;
        }

        .ss-truck-wheel span {
          position: absolute;

          inset: 7px;

          border-radius: 50%;

          background:
            #8f99a2;
        }

        .ss-truck-label {
          position: absolute;

          left: 40px;
          bottom: -39px;

          padding:
            5px 8px;

          border-radius: 6px;

          background:
            rgba(7,10,14,.68);

          border:
            1px solid
            rgba(255,255,255,.10);

          color:
            rgba(255,255,255,.62);

          font-size: 8px;

          font-weight: 800;

          letter-spacing:
            .08em;

          text-transform:
            uppercase;

          white-space:
            nowrap;
        }

        /* ============================================================
           LIVE INVENTORY HUD
           ============================================================ */

        .ss-hud {
          position: absolute;

          left: 34px;
          bottom: 33px;

          z-index: 15;

          display: flex;
          align-items: center;
          gap: 10px;

          padding:
            7px 9px;

          border:
            1px solid
            rgba(255,255,255,.10);

          border-radius: 10px;

          background:
            rgba(6,9,13,.62);

          backdrop-filter:
            blur(12px);

          font-size: 8px;

          color:
            rgba(255,255,255,.48);

          font-weight: 800;

          letter-spacing:
            .10em;

          text-transform:
            uppercase;
        }

        .ss-hud-pip {
          width: 5px;
          height: 5px;

          border-radius: 50%;

          background:
            var(--ss-orange);

          box-shadow:
            0 0 10px
            rgba(255,83,28,.85);
        }

        /* ============================================================
           AUTH SIDE
           ============================================================ */

        .ss-login-panel {
          position: relative;

          display: flex;
          align-items: center;
          justify-content: center;

          min-width: 0;

          padding:
            42px 58px;

          background:
            linear-gradient(
              145deg,
              rgba(18,24,33,.98),
              rgba(9,14,21,.99)
            );
        }

        .ss-panel-inner {
          width: min(
            430px,
            100%
          );
        }

        /* ============================================================
           PANEL BRAND
           ============================================================ */

        .ss-auth-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;

          margin-bottom: 40px;
        }

        .ss-auth-brand-mark {
          display: grid;
          place-items: center;

          width: 38px;
          height: 38px;

          border-radius: 11px;

          background:
            linear-gradient(
              145deg,
              #ff804e,
              #db3b0e
            );

          color: #fff;

          font-size: 16px;

          font-weight: 950;

          box-shadow:
            0 8px 25px
            rgba(255,81,25,.22);
        }

        .ss-auth-brand-copy {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .ss-auth-brand-copy strong {
          color: #fff;

          font-size: 14px;

          font-weight: 850;

          letter-spacing:
            -.02em;
        }

        .ss-auth-brand-copy span {
          color:
            #737f8e;

          font-size: 8px;

          font-weight: 750;

          letter-spacing:
            .12em;

          text-transform:
            uppercase;
        }

        /* ============================================================
           AUTH HEADING
           ============================================================ */

        .ss-auth-heading {
          margin-bottom: 30px;
        }

        .ss-auth-kicker {
          margin-bottom: 9px;

          color:
            #7e8998;

          font-size: 9px;

          font-weight: 850;

          letter-spacing:
            .16em;

          text-transform:
            uppercase;
        }

        .ss-auth-heading h1 {
          margin: 0;

          color: #fff;

          font-size:
            clamp(
              30px,
              3vw,
              42px
            );

          line-height:
            1.05;

          letter-spacing:
            -.045em;

          font-weight: 880;
        }

        .ss-auth-heading p {
          margin:
            11px 0 0;

          color:
            #7e8998;

          font-size: 12px;

          line-height:
            1.65;
        }

        /* ============================================================
           SECURITY CHIP
           ============================================================ */

        .ss-security-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;

          margin-top: 15px;

          padding:
            7px 9px;

          border:
            1px solid
            rgba(255,255,255,.065);

          border-radius: 999px;

          color:
            #8490a0;

          background:
            rgba(255,255,255,.025);

          font-size: 8px;

          font-weight: 800;

          letter-spacing:
            .07em;

          text-transform:
            uppercase;
        }

        .ss-security-chip svg {
          color:
            #73d692;
        }

        /* ============================================================
           FORM
           ============================================================ */

        .ss-auth-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .ss-form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ss-form-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .ss-form-label {
          color:
            #b9c0ca;

          font-size: 10px;

          font-weight: 800;

          letter-spacing:
            .02em;
        }

        .ss-forgot-link {
          color:
            #8a95a4;

          font-size: 10px;

          font-weight: 750;

          text-decoration:
            none;

          transition:
            color .2s ease;
        }

        .ss-forgot-link:hover {
          color:
            #ff8555;
        }

        /* ============================================================
           INPUT
           ============================================================ */

        .ss-input-wrap {
          position: relative;
        }

        .ss-input-icon {
          position: absolute;

          left: 14px;
          top: 50%;

          display: grid;
          place-items: center;

          transform:
            translateY(-50%);

          color:
            #606b79;

          pointer-events: none;

          transition:
            color .2s ease;
        }

        .ss-input-wrap:focus-within
        .ss-input-icon {
          color:
            #ff8050;
        }

        .ss-input {
          width: 100%;
          height: 48px;

          box-sizing: border-box;

          border:
            1px solid
            rgba(255,255,255,.095);

          border-radius: 12px;

          padding:
            0 14px 0 42px;

          background:
            rgba(255,255,255,.035);

          color:
            #f7f8fa;

          outline: none;

          font-family:
            inherit;

          font-size: 12px;

          transition:
            border-color .2s ease,
            background .2s ease,
            box-shadow .2s ease;
        }

        .ss-input::placeholder {
          color:
            #4e5968;
        }

        .ss-input:hover {
          background:
            rgba(255,255,255,.047);
        }

        .ss-input:focus {
          border-color:
            rgba(255,112,65,.58);

          background:
            rgba(255,255,255,.045);

          box-shadow:
            0 0 0 4px
            rgba(255,89,34,.085);
        }

        .ss-input:disabled {
          opacity: .58;
          cursor: not-allowed;
        }

        /* ============================================================
           PASSWORD
           ============================================================ */

        .ss-password-input {
          padding-right:
            50px;
        }

        .ss-password-toggle {
          position: absolute;

          right: 7px;
          top: 50%;

          width: 35px;
          height: 35px;

          display: grid;
          place-items: center;

          transform:
            translateY(-50%);

          border: 0;

          border-radius: 9px;

          background:
            transparent;

          color:
            #697483;

          cursor: pointer;

          transition:
            color .2s ease,
            background .2s ease;
        }

        .ss-password-toggle:hover {
          color: #fff;

          background:
            rgba(255,255,255,.06);
        }

        .ss-password-toggle:disabled {
          cursor:
            not-allowed;

          opacity:
            .45;
        }

        /* ============================================================
           ERROR
           ============================================================ */

        .ss-auth-error {
          display: flex;
          align-items: flex-start;
          gap: 8px;

          padding:
            10px 11px;

          border:
            1px solid
            rgba(239,112,92,.20);

          border-radius: 10px;

          background:
            rgba(239,112,92,.07);

          color:
            #f39a87;

          font-size: 10px;

          line-height:
            1.5;

          font-weight: 700;
        }

        .ss-error-dot {
          width: 6px;
          height: 6px;

          margin-top: 4px;

          flex: 0 0 6px;

          border-radius: 50%;

          background:
            #ef705c;
        }

        /* ============================================================
           PRIMARY BUTTON
           ============================================================ */

        .ss-login-button {
          position: relative;

          width: 100%;
          height: 48px;

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;

          overflow: hidden;

          border: 0;

          border-radius: 12px;

          background:
            linear-gradient(
              135deg,
              #ff733b,
              #e24413
            );

          color: #fff;

          cursor: pointer;

          font-family:
            inherit;

          font-size: 11px;

          font-weight: 850;

          box-shadow:
            0 13px 28px
            rgba(230,68,18,.17);

          transition:
            transform .2s ease,
            box-shadow .2s ease,
            opacity .2s ease;
        }

        .ss-login-button::before {
          content: "";

          position: absolute;

          top: 0;
          left: -45%;

          width: 35%;
          height: 100%;

          transform:
            skewX(-20deg);

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.20),
              transparent
            );

          transition:
            left .5s ease;
        }

        .ss-login-button:hover::before {
          left: 120%;
        }

        .ss-login-button:hover {
          transform:
            translateY(-2px);

          box-shadow:
            0 17px 34px
            rgba(230,68,18,.25);
        }

        .ss-login-button:active {
          transform:
            translateY(0);
        }

        .ss-login-button:disabled {
          opacity: .62;
          cursor: not-allowed;

          transform:
            none;

          box-shadow:
            none;
        }

        .ss-login-spinner {
          width: 15px;
          height: 15px;

          border:
            2px solid
            rgba(255,255,255,.32);

          border-top-color:
            #fff;

          border-radius: 50%;

          animation:
            ss-spin .7s linear infinite;
        }

        @keyframes ss-spin {
          to {
            transform:
              rotate(360deg);
          }
        }

        /* ============================================================
           DIVIDER
           ============================================================ */

        .ss-divider {
          display: flex;
          align-items: center;
          gap: 11px;

          margin:
            4px 0;
        }

        .ss-divider-line {
          flex: 1;

          height: 1px;

          background:
            rgba(255,255,255,.08);
        }

        .ss-divider-label {
          color:
            #5d6877;

          font-size: 8px;

          font-weight: 850;

          letter-spacing:
            .14em;
        }

        /* ============================================================
           GOOGLE
           ============================================================ */

        .ss-google-wrap {
          position: relative;

          display: flex;
          align-items: center;
          justify-content: center;

          width: 100%;

          min-height: 44px;

          overflow: hidden;

          border-radius: 11px;
        }

        .ss-google-overlay {
          position: absolute;
          inset: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border:
            1px solid
            rgba(255,255,255,.09);

          border-radius: 11px;

          background:
            rgba(255,255,255,.025);

          pointer-events: none;

          opacity: .55;
        }

        .ss-google-wrap > div {
          width: 100% !important;

          display: flex;
          justify-content: center;
        }

        /* ============================================================
           ACCOUNT SWITCH
           ============================================================ */

        .ss-auth-switch {
          margin:
            21px 0 0;

          text-align: center;

          color:
            #697483;

          font-size: 10px;

          line-height: 1.5;
        }

        .ss-auth-switch a {
          color:
            #e9edf1;

          font-weight: 800;

          text-decoration:
            none;

          transition:
            color .2s ease;
        }

        .ss-auth-switch a:hover {
          color:
            #ff8554;
        }

        /* ============================================================
           TRUST ROW
           ============================================================ */

        .ss-trust-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;

          margin-top: 25px;

          padding-top: 18px;

          border-top:
            1px solid
            rgba(255,255,255,.06);

          color:
            #4f5a68;

          font-size: 8px;

          font-weight: 750;

          letter-spacing:
            .06em;

          text-transform:
            uppercase;
        }

        .ss-trust-item {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .ss-trust-item svg {
          color:
            #667180;
        }

        .ss-trust-separator {
          width: 3px;
          height: 3px;

          border-radius: 50%;

          background:
            #404a56;
        }

        /* ============================================================
           RESPONSIVE
           ============================================================ */

        @media (max-width: 1120px) {
          .ss-login-shell {
            grid-template-columns:
              minmax(0, 1fr)
              minmax(390px, .78fr);

            min-height:
              710px;
          }

          .ss-visual-copy {
            left: 40px;
            bottom: 195px;
          }

          .ss-login-panel {
            padding:
              40px;
          }
        }

        @media (max-width: 900px) {
          .ss-login-page {
            padding:
              16px;
          }

          .ss-login-shell {
            grid-template-columns:
              1fr;

            min-height:
              auto;

            max-width:
              560px;
          }

          .ss-login-visual {
            min-height:
              330px;

            border-right:
              0;

            border-bottom:
              1px solid
              rgba(255,255,255,.08);
          }

          .ss-visual-copy {
            left: 30px;
            right: 30px;
            bottom: 65px;
          }

          .ss-visual-copy h2 {
            font-size:
              clamp(29px, 7vw, 43px);
          }

          .ss-float-card.one {
            left: 20px;
            top: 92px;
          }

          .ss-float-card.two {
            right: 20px;
            top: 103px;
          }

          .ss-float-card.three {
            right: 20px;
            bottom: 95px;
          }

          .ss-road {
            bottom: 35px;
          }

          .ss-truck-layer {
            bottom: 22px;
          }

          .ss-hud {
            bottom: 16px;
            left: 20px;
          }

          .ss-login-panel {
            padding:
              42px 34px 36px;
          }

          .ss-auth-brand {
            margin-bottom:
              31px;
          }
        }

        @media (max-width: 600px) {
          .ss-login-page {
            padding: 0;
            align-items: stretch;
          }

          .ss-login-shell {
            width: 100%;
            min-height: 100vh;

            border:
              0;

            border-radius:
              0;
          }

          .ss-login-visual {
            min-height:
              280px;
          }

          .ss-visual-topbar {
            top: 17px;
            left: 17px;
            right: 17px;
          }

          .ss-visual-copy {
            left: 20px;
            right: 20px;
            bottom: 46px;
          }

          .ss-visual-copy p {
            display: none;
          }

          .ss-float-card.two {
            display: none;
          }

          .ss-float-card.three {
            display: none;
          }

          .ss-float-card.one {
            top: 78px;
            left: 18px;
          }

          .ss-login-panel {
            align-items: flex-start;

            padding:
              32px 22px 28px;
          }

          .ss-panel-inner {
            width: 100%;
          }

          .ss-auth-heading {
            margin-bottom:
              25px;
          }

          .ss-auth-heading h1 {
            font-size:
              32px;
          }

          .ss-auth-form {
            gap: 16px;
          }

          .ss-trust-row {
            gap: 8px;
            font-size: 7px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ss-login-glow,
          .ss-status-dot,
          .ss-float-card,
          .ss-truck-unit,
          .ss-route-line,
          .ss-road::before,
          .ss-login-button::before,
          .ss-login-spinner {
            animation: none !important;
          }

          .ss-login-button,
          .ss-password-toggle,
          .ss-input,
          .ss-forgot-link,
          .ss-auth-switch a {
            transition: none !important;
          }
        }
      `}</style>

      <main className="ss-login-page">
        {/* ==========================================================
            BACKGROUND EFFECTS
            ========================================================== */}

        <div
          className="ss-login-grid"
          aria-hidden="true"
        />

        <div
          className="ss-login-noise"
          aria-hidden="true"
        />

        <div
          className="ss-login-glow one"
          aria-hidden="true"
        />

        <div
          className="ss-login-glow two"
          aria-hidden="true"
        />

        {/* ==========================================================
            MAIN APPLICATION SHELL
            ========================================================== */}

        <section className="ss-login-shell">
          {/* ========================================================
              LEFT — LIVE LOGISTICS WORLD
              ======================================================== */}

          <section className="ss-login-visual">
            <div className="ss-visual-vignette" />

            {/* Top status */}
            <div className="ss-visual-topbar">
              <div className="ss-brand-chip">
                <div className="ss-brand-mini">
                  S
                </div>

                <span>
                  StockSense
                </span>
              </div>

              <div className="ss-system-status">
                <span className="ss-status-dot" />
                Live logistics network
              </div>
            </div>

            {/* Floating Inventory Cards */}

            <InventoryFloatCard
              type="one"
              title="Inventory"
              value="24,816 units"
              icon={BoxesIcon}
            />

            <InventoryFloatCard
              type="two"
              title="Active routes"
              value="128 running"
              icon={TruckIcon}
            />

            <InventoryFloatCard
              type="three"
              title="System activity"
              value="+18.4%"
              icon={ActivityIcon}
            />

            {/* Hero copy */}

            <div className="ss-visual-copy">
              <div className="ss-visual-eyebrow">
                <span className="ss-visual-eyebrow-line" />

                Smart inventory operations
              </div>

              <h2>
                Move stock.
                <br />

                <span>
                  Move faster.
                </span>
              </h2>

              <p>
                One command center for products,
                warehouses, stock movements and
                real-time inventory visibility.
              </p>
            </div>

            {/* Road */}

            <div
              className="ss-road"
              aria-hidden="true"
            />

            <div
              className="ss-route-line"
              aria-hidden="true"
            />

            {/* Moving 3D Trucks */}

            <div
              className="ss-truck-layer"
              aria-hidden="true"
            >
              <MovingTruck
                className="hero"
                label="Inbound"
              />

              <MovingTruck
                className="fast"
                label="Delivery"
              />

              <MovingTruck
                className="reverse"
                label="Transfer"
              />

              <MovingTruck
                className="fast"
                label="Dispatch"
              />
            </div>

            {/* Bottom live HUD */}

            <div className="ss-hud">
              <span className="ss-hud-pip" />

              LIVE INVENTORY TELEMETRY

              <span>
                •
              </span>

              24/7 TRACKING
            </div>
          </section>

          {/* ========================================================
              RIGHT — AUTHENTICATION
              ======================================================== */}

          <section className="ss-login-panel">
            <div className="ss-panel-inner">
              {/* Brand */}

              <div className="ss-auth-brand">
                <div className="ss-auth-brand-mark">
                  S
                </div>

                <div className="ss-auth-brand-copy">
                  <strong>
                    StockSense
                  </strong>

                  <span>
                    Inventory Management
                  </span>
                </div>
              </div>

              {/* Heading */}

              <div className="ss-auth-heading">
                <div className="ss-auth-kicker">
                  Secure workspace access
                </div>

                <h1>
                  Welcome back.
                </h1>

                <p>
                  Sign in to continue managing
                  your inventory operations.
                </p>

                <div className="ss-security-chip">
                  <ShieldIcon size={13} />

                  Protected session
                </div>
              </div>

              {/* ====================================================
                  LOGIN FORM
                  ==================================================== */}

              <form
                className="ss-auth-form"
                onSubmit={handleSubmit}
              >
                {/* Email */}

                <div className="ss-form-group">
                  <label
                    className="ss-form-label"
                    htmlFor="email"
                  >
                    Email address
                  </label>

                  <div className="ss-input-wrap">
                    <span
                      className="ss-input-icon"
                      aria-hidden="true"
                    >
                      <MailIcon
                        size={17}
                      />
                    </span>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      value={form.email}
                      onChange={handleChange}
                      disabled={loading}
                      className="ss-input"
                    />
                  </div>
                </div>

                {/* Password */}

                <div className="ss-form-group">
                  <div className="ss-form-label-row">
                    <label
                      className="ss-form-label"
                      htmlFor="password"
                    >
                      Password
                    </label>

                    <Link
                      className="ss-forgot-link"
                      to="/forgot-password"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="ss-input-wrap">
                    <span
                      className="ss-input-icon"
                      aria-hidden="true"
                    >
                      <LockIcon
                        size={17}
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
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      value={
                        form.password
                      }
                      onChange={
                        handleChange
                      }
                      disabled={loading}
                      className="ss-input ss-password-input"
                    />

                    <button
                      type="button"
                      className="ss-password-toggle"
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
                      disabled={loading}
                    >
                      <EyeIcon
                        open={
                          showPassword
                        }
                        size={17}
                      />
                    </button>
                  </div>
                </div>

                {/* Error */}

                {error && (
                  <div
                    className="ss-auth-error"
                    role="alert"
                  >
                    <span className="ss-error-dot" />

                    <span>
                      {error}
                    </span>
                  </div>
                )}

                {/* Login */}

                <button
                  type="submit"
                  className="ss-login-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner />

                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in to StockSense

                      <ArrowRightIcon
                        size={17}
                      />
                    </>
                  )}
                </button>
              </form>

              {/* ====================================================
                  GOOGLE DIVIDER
                  ==================================================== */}

              <div className="ss-divider">
                <span className="ss-divider-line" />

                <span className="ss-divider-label">
                  OR
                </span>

                <span className="ss-divider-line" />
              </div>

              {/* ====================================================
                  GOOGLE LOGIN
                  ==================================================== */}

              <div className="ss-google-wrap">
                <GoogleLogin
                  onSuccess={
                    handleGoogleSuccess
                  }
                  onError={
                    handleGoogleError
                  }
                  useOneTap={false}
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                  width="350"
                />
              </div>

              {/* ====================================================
                  SIGNUP
                  ==================================================== */}

              <p className="ss-auth-switch">
                Don&apos;t have an account?{" "}

                <Link to="/signup">
                  Create account
                </Link>
              </p>

              {/* ====================================================
                  TRUST FOOTER
                  ==================================================== */}

              <div className="ss-trust-row">
                <span className="ss-trust-item">
                  <ShieldIcon
                    size={11}
                  />

                  Secure access
                </span>

                <span className="ss-trust-separator" />

                <span className="ss-trust-item">
                  <LockIcon
                    size={11}
                  />

                  Protected session
                </span>

                <span className="ss-trust-separator" />

                <span className="ss-trust-item">
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