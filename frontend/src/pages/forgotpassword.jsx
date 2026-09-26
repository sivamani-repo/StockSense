import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  requestPasswordReset,
  resetPassword,
} from "../services/authService";

/* ========================================================================
   STOCKSENSE — FORGOT PASSWORD / ACCOUNT RECOVERY
   ------------------------------------------------------------------------
   UI contribution: Varun
   Existing API contract intentionally preserved.

   Existing service calls preserved:
     requestPasswordReset(email)
     resetPassword(email, otp, password)

   Creative UI:
     • cinematic logistics control room
     • animated warehouse / road
     • CSS-only 3D trucks
     • interactive mini warehouse manager
     • manager follows focused input
     • manager reacts while typing
     • OTP command-center panel
     • password strength telemetry
     • success celebration
     • responsive layout
     • reduced-motion support
   ======================================================================== */

/* ========================================================================
   ICONS
   ======================================================================== */

function MailIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m4.5 7 6.15 4.7a2.1 2.1 0 0 0 2.7 0L19.5 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="15" r="1.2" fill="currentColor" />
    </svg>
  );
}

function ShieldIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3.5 19 6v5.45c0 4.42-2.95 7.8-7 9.4-4.05-1.6-7-4.98-7-9.4V6l7-2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m8.8 12 2.1 2.1 4.4-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 20c.7-3.55 3.1-5.5 7-5.5s6.3 1.95 7 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon({ open, size = 18 }) {
  if (open) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M2.5 12s3.45-6 9.5-6 9.5 6 9.5 6-3.45 6-9.5 6-9.5-6-9.5-6Z" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="12" r="2.7" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 3.5 21 20.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9.9 6.25A8.9 8.9 0 0 1 12 6c6.05 0 9.5 6 9.5 6a18 18 0 0 1-3.12 3.57" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M6.3 8.45C3.95 10.05 2.5 12 2.5 12s3.45 6 9.5 6c1.05 0 2.02-.17 2.88-.45" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ArrowRightIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m13 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowLeftIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m11 18-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5 12.5 4.2 4.2L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function KeyIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="8" cy="15" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="m11 12 8-8m-3 3 2 2m-5 1 2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function TruckIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6.5h11v9.5H3z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M14 10h3.5l3 3.2V16H14z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="7" cy="17" r="1.8" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="18" cy="17" r="1.8" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function BoxesIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 8 4.2v9.6L12 21l-8-4.2V7.2L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M4.4 7.4 12 11.5l7.6-4.1M12 11.5V21" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function ActivityIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 12h4l2.2-5.5L13 17l2.4-7 1.7 2H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Spinner() {
  return <span className="fp-spinner" aria-hidden="true" />;
}

/* ========================================================================
   MANAGER ASSISTANT
   ======================================================================== */

function ManagerAssistant({ field, step, typing, error, success }) {
  const stateKey = error
    ? "error"
    : success
    ? "success"
    : typing
    ? "typing"
    : field || `step-${step}`;

  const messages = {
    email: [
      "Easy boss 😎 type your email.",
      "I’m checking the address 👀",
      "Looks like a delivery route... but for OTPs.",
    ],
    otp: [
      "Six digits. I’m counting. 😭",
      "Boss, please don’t type the warehouse PIN 😂",
      "OTP incoming. Stay locked in.",
    ],
    password: [
      "Make it strong. I guard this warehouse. 🫡",
      "Long password = happy manager.",
      "No ‘12345678’, boss. Please. 😭",
    ],
    confirmPassword: [
      "Same password, please. I’m watching. 👀",
      "Match it exactly, commander.",
      "One typo and I’m calling security. 😂",
    ],
    typing: [
      "I see you typing... suspicious. 👀",
      "Keyboard detected. Operator confirmed.",
      "Productivity level: loading...",
    ],
    error: [
      "Uh-oh. Let me inspect that. 🧐",
      "Something didn’t pass my checkpoint.",
      "Don’t panic. Warehouses have problems too.",
    ],
    success: [
      "MISSION COMPLETE. 🚚",
      "Password reset. Warehouse secured. 🫡",
      "Nice work, boss. Back to operations!",
    ],
    "step-1": [
      "Welcome to the recovery dock.",
      "Tell me where to send the OTP.",
    ],
    "step-2": [
      "OTP checkpoint is open.",
      "Now secure the new password.",
    ],
    "step-3": [
      "We’re all set. 🚚",
      "Security checkpoint cleared.",
    ],
  };

  const set = messages[stateKey] || messages.typing;
  const message = set[Math.floor(Date.now() / 1800) % set.length];

  return (
    <div className={`fp-manager fp-manager-${field || "idle"}`} aria-hidden="true">
      <div className="fp-manager-bubble">
        <span>{message}</span>
      </div>

      <div className="fp-manager-character">
        <div className="fp-manager-head">
          <div className="fp-manager-hair" />
          <div className="fp-manager-face">
            <i className="fp-manager-eye left" />
            <i className="fp-manager-eye right" />
            <span className="fp-manager-smile" />
          </div>
        </div>

        <div className="fp-manager-body">
          <div className="fp-manager-badge">SS</div>
          <div className="fp-manager-arm left" />
          <div className="fp-manager-arm right" />
        </div>

        <div className="fp-manager-legs">
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

/* ========================================================================
   MOVING TRUCK
   ======================================================================== */

function MovingTruck({ className = "", label = "" }) {
  return (
    <div className={`fp-truck ${className}`}>
      <div className="fp-truck-shadow" />

      <div className="fp-truck-body">
        <div className="fp-trailer">
          <span />
          <span />
          <span />
        </div>

        <div className="fp-truck-cab">
          <div className="fp-truck-window" />
          <div className="fp-truck-light one" />
          <div className="fp-truck-light two" />
        </div>
      </div>

      <div className="fp-wheel rear">
        <i />
      </div>

      <div className="fp-wheel front">
        <i />
      </div>

      {label && (
        <div className="fp-truck-label">
          {label}
        </div>
      )}
    </div>
  );
}

/* ========================================================================
   STEP INDICATOR
   ======================================================================== */

function RecoverySteps({ step }) {
  const steps = [
    { id: 1, label: "Email" },
    { id: 2, label: "Verify" },
    { id: 3, label: "Secure" },
  ];

  return (
    <div className="fp-steps">
      {steps.map((item, index) => {
        const active = step === item.id;
        const completed = step > item.id;

        return (
          <div className="fp-step-slot" key={item.id}>
            <div className={`fp-step ${active ? "active" : ""} ${completed ? "completed" : ""}`}>
              <span className="fp-step-number">
                {completed ? <CheckIcon size={14} /> : item.id}
              </span>
              <span className="fp-step-label">
                {item.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <span className={`fp-step-line ${step > item.id ? "filled" : ""}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ========================================================================
   PASSWORD STRENGTH
   ======================================================================== */

function PasswordStrength({ password }) {
  const result = useMemo(() => {
    if (!password) {
      return {
        score: 0,
        label: "Awaiting password",
        width: "0%",
      };
    }

    let score = 0;

    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) {
      return {
        score,
        label: "Needs reinforcement",
        width: "34%",
      };
    }

    if (score <= 4) {
      return {
        score,
        label: "Good",
        width: "68%",
      };
    }

    return {
      score,
      label: "Excellent",
      width: "100%",
    };
  }, [password]);

  return (
    <div className="fp-strength">
      <div className="fp-strength-header">
        <span>Password security</span>
        <strong>{result.label}</strong>
      </div>

      <div className="fp-strength-track">
        <span style={{ width: result.width }} />
      </div>

      <div className="fp-password-rules">
        <span className={password.length >= 8 ? "ok" : ""}>
          8+ chars
        </span>
        <span className={/[A-Z]/.test(password) ? "ok" : ""}>
          Uppercase
        </span>
        <span className={/[0-9]/.test(password) ? "ok" : ""}>
          Number
        </span>
        <span className={/[^A-Za-z0-9]/.test(password) ? "ok" : ""}>
          Symbol
        </span>
      </div>
    </div>
  );
}

/* ========================================================================
   INPUT SHELL
   ======================================================================== */

function FieldShell({
  label,
  icon: Icon,
  field,
  activeField,
  setActiveField,
  typing,
  error,
  children,
}) {
  const active = activeField === field;

  return (
    <div className={`fp-field ${active ? "active" : ""}`}>
      <div className="fp-field-label-row">
        <label>
          {label}
        </label>
      </div>

      <div className="fp-field-input-wrap">
        <span className="fp-field-icon">
          <Icon size={16} />
        </span>

        {children({
          onFocus: () => setActiveField(field),
          onBlur: () => setActiveField("") ,
        })}

        {(active || (typing && active)) && (
          <ManagerAssistant
            field={field}
            typing={active && typing}
            error={Boolean(error && active)}
          />
        )}
      </div>
    </div>
  );
}

/* ========================================================================
   MAIN COMPONENT
   ======================================================================== */

export default function ForgotPassword() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [activeField, setActiveField] = useState("");
  const [typingField, setTypingField] = useState("");

  const typingTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (typingTimer.current) {
        window.clearTimeout(typingTimer.current);
      }
    };
  }, []);

  function markTyping(field) {
    setTypingField(field);

    if (typingTimer.current) {
      window.clearTimeout(typingTimer.current);
    }

    typingTimer.current = window.setTimeout(() => {
      setTypingField("");
    }, 900);
  }

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  /* ======================================================================
     ORIGINAL OTP REQUEST FLOW — PRESERVED
     ====================================================================== */

  async function handleRequestOtp(event) {
    event.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await requestPasswordReset(
        email.trim()
      );

      if (response?.otp) {
        console.log(
          "Development OTP:",
          response.otp
        );
      }

      setStep(2);
      setActiveField("otp");
    } catch (err) {
      setError(
        err?.message ||
          "Unable to request OTP."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ======================================================================
     ORIGINAL RESET FLOW — PRESERVED
     ====================================================================== */

  async function handleResetPassword(event) {
    event.preventDefault();

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    if (otp.trim().length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    if (!password) {
      setError("Please enter a new password.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
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
      setActiveField("");
    } catch (err) {
      setError(
        err?.message ||
          "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    clearMessages();

    if (step === 2) {
      setStep(1);
      setActiveField("email");
    }
  }

  function handleEmailChange(event) {
    setEmail(event.target.value);
    setError("");
    setSuccess("");
    markTyping("email");
  }

  function handleOtpChange(event) {
    const cleanOtp = event.target.value.replace(/\D/g, "");

    setOtp(cleanOtp);
    setError("");
    markTyping("otp");
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
    setError("");
    markTyping("password");
  }

  function handleConfirmPasswordChange(event) {
    setConfirmPassword(event.target.value);
    setError("");
    markTyping("confirmPassword");
  }

  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email.trim()
  );

  const otpComplete = otp.trim().length === 6;

  const passwordsMatch =
    Boolean(password) &&
    Boolean(confirmPassword) &&
    password === confirmPassword;

  const managerTyping = Boolean(typingField);

  return (
    <>
      <style>{`
        /* ==================================================================
           ROOT / RESET
           ================================================================== */

        .fp-page {
          --fp-bg: #060a10;
          --fp-panel: #0d131b;
          --fp-panel-soft: #111923;
          --fp-white: #f6f8fa;
          --fp-muted: #7f8b9b;
          --fp-dim: #566171;
          --fp-line: rgba(255,255,255,.085);
          --fp-orange: #ff672e;
          --fp-orange-light: #ff956c;
          --fp-green: #75d995;
          --fp-red: #ee7664;

          position: relative;
          min-height: 100vh;
          width: 100%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 26px;
          box-sizing: border-box;
          background:
            radial-gradient(circle at 4% 12%, rgba(255,84,31,.13), transparent 26%),
            radial-gradient(circle at 96% 87%, rgba(255,96,37,.08), transparent 27%),
            var(--fp-bg);
          color: var(--fp-white);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .fp-page * {
          box-sizing: border-box;
        }

        .fp-grid {
          position: absolute;
          inset: 0;
          opacity: .16;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
        }

        .fp-orb {
          position: absolute;
          width: 470px;
          height: 470px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,84,27,.15), transparent 70%);
          filter: blur(16px);
          pointer-events: none;
          animation: fp-orb-breathe 8s ease-in-out infinite;
        }

        .fp-orb.a {
          left: -210px;
          top: -180px;
        }

        .fp-orb.b {
          right: -210px;
          bottom: -190px;
          animation-delay: -3s;
        }

        @keyframes fp-orb-breathe {
          0%,100% {
            opacity: .58;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.12);
          }
        }

        /* ==================================================================
           SHELL
           ================================================================== */

        .fp-shell {
          position: relative;
          z-index: 3;
          width: min(1460px, 100%);
          min-height: 790px;
          display: grid;
          grid-template-columns: minmax(0, 1.12fr) minmax(420px, .88fr);
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.10);
          border-radius: 30px;
          background: rgba(8,12,18,.92);
          box-shadow: 0 44px 135px rgba(0,0,0,.56), inset 0 1px 0 rgba(255,255,255,.035);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
        }

        /* ==================================================================
           VISUAL SIDE
           ================================================================== */

        .fp-visual {
          position: relative;
          min-width: 0;
          overflow: hidden;
          border-right: 1px solid rgba(255,255,255,.07);
          background:
            linear-gradient(90deg, rgba(4,7,12,.78), rgba(4,7,12,.14) 65%, transparent 100%),
            linear-gradient(180deg, rgba(4,7,12,.08), rgba(4,7,12,.58)),
            url("/images/stocksense-warehouse.png") center / cover no-repeat,
            radial-gradient(circle at 70% 68%, #322018, #10151d 68%);
        }

        .fp-visual::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 55% 47%, transparent 10%, rgba(2,4,7,.17) 57%, rgba(2,4,7,.72) 100%);
          pointer-events: none;
        }

        .fp-topbar {
          position: absolute;
          z-index: 20;
          top: 25px;
          left: 27px;
          right: 27px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .fp-brand-pill {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 7px 10px;
          border: 1px solid rgba(255,255,255,.11);
          border-radius: 12px;
          background: rgba(4,7,11,.31);
          backdrop-filter: blur(14px);
        }

        .fp-brand-mark {
          width: 27px;
          height: 27px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: linear-gradient(145deg, #ff7f4d, #d9360a);
          color: white;
          font-size: 12px;
          font-weight: 950;
          box-shadow: 0 0 20px rgba(255,84,26,.27);
        }

        .fp-brand-pill span {
          color: rgba(255,255,255,.64);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .fp-live-status {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 10px;
          border: 1px solid rgba(255,255,255,.10);
          border-radius: 999px;
          background: rgba(3,7,11,.32);
          backdrop-filter: blur(14px);
          color: rgba(255,255,255,.60);
          font-size: 8px;
          font-weight: 800;
          letter-spacing: .09em;
          text-transform: uppercase;
        }

        .fp-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--fp-green);
          box-shadow: 0 0 0 4px rgba(117,217,149,.08), 0 0 14px rgba(117,217,149,.63);
          animation: fp-live-pulse 2.3s ease-in-out infinite;
        }

        @keyframes fp-live-pulse {
          0%,100% { opacity: .52; }
          50% { opacity: 1; }
        }

        /* ==================================================================
           VISUAL COPY
           ================================================================== */

        .fp-visual-copy {
          position: absolute;
          z-index: 18;
          left: 49px;
          right: 46px;
          bottom: 225px;
        }

        .fp-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 13px;
          color: rgba(255,255,255,.60);
          font-size: 9px;
          font-weight: 850;
          letter-spacing: .17em;
          text-transform: uppercase;
        }

        .fp-kicker-line {
          width: 31px;
          height: 1px;
          background: linear-gradient(90deg, var(--fp-orange), transparent);
        }

        .fp-visual-copy h2 {
          max-width: 690px;
          margin: 0;
          color: #fff;
          font-size: clamp(35px, 4vw, 63px);
          line-height: .96;
          letter-spacing: -.058em;
          font-weight: 900;
          text-shadow: 0 14px 40px rgba(0,0,0,.43);
        }

        .fp-visual-copy h2 span {
          color: var(--fp-orange-light);
        }

        .fp-visual-copy p {
          max-width: 560px;
          margin: 17px 0 0;
          color: rgba(255,255,255,.62);
          font-size: 12px;
          line-height: 1.72;
        }

        /* ==================================================================
           LIVE CARDS
           ================================================================== */

        .fp-live-card {
          position: absolute;
          z-index: 19;
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 150px;
          padding: 10px 12px;
          border: 1px solid rgba(255,255,255,.11);
          border-radius: 13px;
          background: rgba(6,10,15,.59);
          box-shadow: 0 18px 38px rgba(0,0,0,.27);
          backdrop-filter: blur(16px);
          animation: fp-card-float 5.1s ease-in-out infinite;
        }

        .fp-live-card.a {
          left: 29px;
          top: 135px;
        }

        .fp-live-card.b {
          right: 30px;
          top: 173px;
          animation-delay: -2s;
        }

        .fp-live-card.c {
          right: 59px;
          bottom: 328px;
          animation-delay: -3.3s;
        }

        @keyframes fp-card-float {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .fp-live-icon {
          width: 29px;
          height: 29px;
          flex: 0 0 29px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: rgba(255,255,255,.065);
          color: var(--fp-orange-light);
        }

        .fp-live-card-copy {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .fp-live-card-copy span {
          color: rgba(255,255,255,.43);
          font-size: 8px;
          font-weight: 750;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .fp-live-card-copy strong {
          color: #fff;
          font-size: 12px;
          font-weight: 850;
        }

        .fp-live-card-status {
          width: 5px;
          height: 5px;
          margin-left: auto;
          border-radius: 50%;
          background: var(--fp-green);
          box-shadow: 0 0 9px rgba(117,217,149,.68);
        }

        /* ==================================================================
           ROAD / TRACK
           ================================================================== */

        .fp-road {
          position: absolute;
          z-index: 7;
          left: -7%;
          right: -7%;
          bottom: 77px;
          height: 175px;
          transform: perspective(700px) rotateX(55deg);
          transform-origin: bottom center;
          border-top: 1px solid rgba(255,255,255,.12);
          background: linear-gradient(180deg, rgba(10,14,19,.80), rgba(2,5,8,.98));
        }

        .fp-road::before {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          height: 3px;
          background: repeating-linear-gradient(90deg, rgba(255,255,255,.32) 0 60px, transparent 60px 108px);
          animation: fp-road-move 2.2s linear infinite;
        }

        @keyframes fp-road-move {
          from { background-position: 0 0; }
          to { background-position: -168px 0; }
        }

        .fp-route {
          position: absolute;
          z-index: 9;
          left: -8%;
          width: 116%;
          bottom: 105px;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(255,79,22,.78) 25%, rgba(255,139,84,.96) 51%, rgba(255,78,22,.52) 76%, transparent);
          filter: drop-shadow(0 0 9px rgba(255,76,22,.80));
          animation: fp-route-flow 3.3s linear infinite;
        }

        @keyframes fp-route-flow {
          from { transform: translateX(-165px); }
          to { transform: translateX(165px); }
        }

        /* ==================================================================
           TRUCKS
           ================================================================== */

        .fp-truck-layer {
          position: absolute;
          z-index: 12;
          left: 0;
          right: 0;
          bottom: 57px;
          height: 184px;
          overflow: hidden;
          pointer-events: none;
        }

        .fp-truck {
          position: absolute;
          left: -230px;
          width: 175px;
          height: 87px;
          filter: drop-shadow(0 19px 14px rgba(0,0,0,.38));
          animation: fp-truck-drive 11.8s linear infinite;
        }

        .fp-truck.one {
          animation-delay: -7.7s;
        }

        .fp-truck.two {
          transform: scale(.60);
          animation-duration: 8.2s;
          animation-delay: -2.7s;
        }

        .fp-truck.three {
          transform: scale(.47);
          animation-duration: 14.5s;
          animation-delay: -9.3s;
        }

        @keyframes fp-truck-drive {
          from { left: -235px; }
          to { left: calc(100% + 235px); }
        }

        .fp-truck-shadow {
          position: absolute;
          left: 12px;
          bottom: -2px;
          width: 151px;
          height: 15px;
          border-radius: 50%;
          background: rgba(0,0,0,.60);
          filter: blur(5px);
        }

        .fp-truck-body {
          position: absolute;
          left: 8px;
          top: 10px;
          width: 153px;
          height: 58px;
          border-radius: 5px 8px 7px 5px;
          background: linear-gradient(180deg, #2c3743, #121a24);
          border: 1px solid rgba(255,255,255,.11);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
        }

        .fp-trailer {
          position: absolute;
          left: 3px;
          top: 4px;
          width: 108px;
          height: 49px;
          overflow: hidden;
          border-radius: 4px;
          background: linear-gradient(145deg, #37434f, #151e28);
          border: 1px solid rgba(255,255,255,.075);
        }

        .fp-trailer span {
          position: absolute;
          left: 11px;
          top: 11px;
          width: 72px;
          height: 1px;
          background: rgba(255,255,255,.13);
        }

        .fp-trailer span:nth-child(2) {
          top: 21px;
          width: 53px;
        }

        .fp-trailer span:nth-child(3) {
          top: 31px;
          width: 28px;
          background: rgba(255,91,31,.68);
        }

        .fp-truck-cab {
          position: absolute;
          right: 3px;
          top: 13px;
          width: 38px;
          height: 43px;
          border-radius: 7px 7px 5px 4px;
          background: linear-gradient(150deg, #36424e, #141d26);
          border: 1px solid rgba(255,255,255,.12);
        }

        .fp-truck-window {
          position: absolute;
          left: 5px;
          top: 5px;
          width: 26px;
          height: 16px;
          border-radius: 4px 5px 2px 2px;
          background: linear-gradient(145deg, rgba(127,193,222,.66), rgba(16,31,44,.84));
          border: 1px solid rgba(255,255,255,.13);
        }

        .fp-truck-light {
          position: absolute;
          bottom: 4px;
          width: 5px;
          height: 4px;
          border-radius: 1px;
          background: #ff7449;
          box-shadow: 0 0 8px rgba(255,91,40,.95);
        }

        .fp-truck-light.one { left: 4px; }
        .fp-truck-light.two { right: 4px; }

        .fp-wheel {
          position: absolute;
          bottom: -11px;
          width: 25px;
          height: 25px;
          border-radius: 50%;
          background: radial-gradient(circle, #74808a 0 16%, #11171d 18% 61%, #020406 63% 100%);
          border: 2px solid #151c24;
          animation: fp-wheel-spin .55s linear infinite;
        }

        .fp-wheel.rear { left: 24px; }
        .fp-wheel.front { right: 15px; }

        .fp-wheel i {
          position: absolute;
          inset: 7px;
          border-radius: 50%;
          background: #8e99a2;
        }

        @keyframes fp-wheel-spin {
          to { transform: rotate(360deg); }
        }

        .fp-truck-label {
          position: absolute;
          left: 46px;
          bottom: -38px;
          padding: 5px 8px;
          border: 1px solid rgba(255,255,255,.10);
          border-radius: 6px;
          background: rgba(5,8,12,.66);
          color: rgba(255,255,255,.56);
          font-size: 8px;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .fp-telemetry {
          position: absolute;
          z-index: 17;
          left: 30px;
          bottom: 24px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 10px;
          border: 1px solid rgba(255,255,255,.09);
          border-radius: 9px;
          background: rgba(5,8,12,.63);
          backdrop-filter: blur(12px);
          color: rgba(255,255,255,.46);
          font-size: 8px;
          font-weight: 800;
          letter-spacing: .09em;
          text-transform: uppercase;
        }

        .fp-telemetry-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--fp-orange);
          box-shadow: 0 0 10px rgba(255,84,28,.84);
        }

        /* ==================================================================
           RIGHT PANEL
           ================================================================== */

        .fp-panel {
          position: relative;
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 42px 55px;
          background: linear-gradient(145deg, #121923, #090e15);
        }

        .fp-panel-inner {
          width: min(450px, 100%);
        }

        .fp-auth-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
        }

        .fp-auth-logo {
          width: 39px;
          height: 39px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: linear-gradient(145deg, #ff7e4c, #d63a0c);
          color: #fff;
          font-size: 16px;
          font-weight: 950;
          box-shadow: 0 9px 25px rgba(255,80,24,.22);
        }

        .fp-auth-brand-copy {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .fp-auth-brand-copy strong {
          color: #fff;
          font-size: 14px;
          font-weight: 850;
        }

        .fp-auth-brand-copy span {
          color: #6f7b89;
          font-size: 8px;
          font-weight: 750;
          letter-spacing: .11em;
          text-transform: uppercase;
        }

        /* ==================================================================
           RECOVERY HEADER
           ================================================================== */

        .fp-heading {
          position: relative;
          margin-bottom: 17px;
        }

        .fp-heading-kicker {
          margin-bottom: 8px;
          color: #7b8795;
          font-size: 8px;
          font-weight: 850;
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        .fp-heading h1 {
          margin: 0;
          color: #fff;
          font-size: clamp(29px, 3vw, 41px);
          line-height: 1.04;
          letter-spacing: -.047em;
          font-weight: 900;
        }

        .fp-heading p {
          max-width: 400px;
          margin: 9px 0 0;
          color: #7d8998;
          font-size: 11px;
          line-height: 1.65;
        }

        .fp-security {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 11px;
          padding: 6px 8px;
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 999px;
          background: rgba(255,255,255,.025);
          color: #778392;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: .05em;
          text-transform: uppercase;
        }

        .fp-security svg {
          color: var(--fp-green);
        }

        /* ==================================================================
           STEPS
           ================================================================== */

        .fp-steps {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          margin: 18px 0 25px;
        }

        .fp-step-slot {
          position: relative;
          display: flex;
          align-items: center;
        }

        .fp-step-slot:not(:last-child) {
          justify-content: flex-start;
        }

        .fp-step {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 7px;
          color: #586473;
          font-size: 8px;
          font-weight: 800;
          white-space: nowrap;
        }

        .fp-step-number {
          width: 25px;
          height: 25px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 50%;
          background: #101720;
          color: #6d7887;
          font-size: 8px;
          font-weight: 900;
          transition: .25s ease;
        }

        .fp-step.active .fp-step-number {
          border-color: rgba(255,102,46,.48);
          background: rgba(255,102,46,.13);
          color: var(--fp-orange-light);
          box-shadow: 0 0 0 5px rgba(255,102,46,.05);
        }

        .fp-step.completed .fp-step-number {
          border-color: rgba(117,217,149,.30);
          background: rgba(117,217,149,.10);
          color: var(--fp-green);
        }

        .fp-step.active .fp-step-label,
        .fp-step.completed .fp-step-label {
          color: #b8c0ca;
        }

        .fp-step-line {
          position: absolute;
          left: 26px;
          right: 15px;
          height: 1px;
          background: rgba(255,255,255,.07);
        }

        .fp-step-line.filled {
          background: rgba(117,217,149,.33);
        }

        /* ==================================================================
           FORM
           ================================================================== */

        .fp-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .fp-field {
          position: relative;
        }

        .fp-field-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 7px;
        }

        .fp-field-label-row label {
          color: #afb7c1;
          font-size: 9px;
          font-weight: 800;
        }

        .fp-field-input-wrap {
          position: relative;
        }

        .fp-field-icon {
          position: absolute;
          z-index: 2;
          left: 13px;
          top: 50%;
          display: grid;
          place-items: center;
          transform: translateY(-50%);
          color: #5d6977;
          pointer-events: none;
          transition: color .2s ease;
        }

        .fp-field.active .fp-field-icon {
          color: var(--fp-orange-light);
        }

        .fp-input,
        .fp-select {
          width: 100%;
          height: 45px;
          border: 1px solid rgba(255,255,255,.085);
          border-radius: 11px;
          padding: 0 13px 0 41px;
          outline: none;
          background: rgba(255,255,255,.032);
          color: #f5f7fa;
          font-family: inherit;
          font-size: 11px;
          transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
        }

        .fp-input::placeholder {
          color: #4d5866;
        }

        .fp-input:hover {
          background: rgba(255,255,255,.042);
        }

        .fp-input:focus,
        .fp-field.active .fp-input {
          border-color: rgba(255,110,64,.50);
          background: rgba(255,255,255,.045);
          box-shadow: 0 0 0 4px rgba(255,87,31,.065);
        }

        .fp-input:disabled {
          opacity: .56;
          cursor: not-allowed;
        }

        /* ==================================================================
           INPUT SPECIALS
           ================================================================== */

        .fp-password-wrap {
          position: relative;
        }

        .fp-password-wrap .fp-input {
          padding-right: 48px;
        }

        .fp-eye {
          position: absolute;
          z-index: 4;
          right: 6px;
          top: 50%;
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          transform: translateY(-50%);
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #687382;
          cursor: pointer;
        }

        .fp-eye:hover {
          background: rgba(255,255,255,.05);
          color: white;
        }

        .fp-otp-input {
          padding-left: 41px;
          padding-right: 14px;
          text-align: center;
          letter-spacing: .44em;
          font-size: 17px;
          font-weight: 850;
        }

        .fp-email-preview {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 3px;
          padding: 9px 10px;
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 10px;
          background: rgba(255,255,255,.02);
        }

        .fp-email-preview-icon {
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: rgba(255,102,46,.09);
          color: var(--fp-orange-light);
        }

        .fp-email-preview-copy {
          min-width: 0;
        }

        .fp-email-preview-copy small {
          display: block;
          color: #5f6a78;
          font-size: 7px;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .fp-email-preview-copy strong {
          display: block;
          margin-top: 2px;
          overflow: hidden;
          color: #c9d0d8;
          font-size: 10px;
          font-weight: 750;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .fp-edit-email {
          margin-left: auto;
          border: 0;
          background: transparent;
          color: #84909f;
          cursor: pointer;
          font-size: 8px;
          font-weight: 800;
        }

        .fp-edit-email:hover {
          color: var(--fp-orange-light);
        }

        /* ==================================================================
           MANAGER CHARACTER
           ================================================================== */

        .fp-manager {
          position: absolute;
          z-index: 8;
          right: 17px;
          top: -46px;
          width: 124px;
          height: 55px;
          pointer-events: none;
          animation: fp-manager-arrive .42s cubic-bezier(.22,.88,.3,1) both;
        }

        @keyframes fp-manager-arrive {
          from {
            opacity: 0;
            transform: translateY(12px) scale(.86);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .fp-manager-bubble {
          position: absolute;
          right: 2px;
          bottom: 44px;
          max-width: 118px;
          padding: 6px 8px;
          border: 1px solid rgba(255,255,255,.10);
          border-radius: 9px 9px 2px 9px;
          background: rgba(12,18,26,.92);
          color: #d9dee5;
          box-shadow: 0 11px 28px rgba(0,0,0,.26);
          backdrop-filter: blur(10px);
          font-size: 7px;
          font-weight: 750;
          line-height: 1.35;
          text-align: left;
        }

        .fp-manager-bubble::after {
          content: "";
          position: absolute;
          right: 13px;
          bottom: -5px;
          width: 9px;
          height: 9px;
          transform: rotate(45deg);
          border-right: 1px solid rgba(255,255,255,.10);
          border-bottom: 1px solid rgba(255,255,255,.10);
          background: #0c121a;
        }

        .fp-manager-character {
          position: absolute;
          right: 17px;
          bottom: -9px;
          width: 58px;
          height: 53px;
          animation: fp-manager-bob 2.8s ease-in-out infinite;
        }

        @keyframes fp-manager-bob {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-2px) rotate(-1deg); }
        }

        .fp-manager-head {
          position: absolute;
          z-index: 3;
          left: 14px;
          top: 0;
          width: 31px;
          height: 31px;
        }

        .fp-manager-face {
          position: absolute;
          inset: 0;
          border-radius: 45% 45% 48% 48%;
          background: #e7a071;
          border: 1px solid rgba(0,0,0,.18);
          box-shadow: inset 4px -3px 0 rgba(0,0,0,.08);
        }

        .fp-manager-hair {
          position: absolute;
          z-index: 3;
          left: 2px;
          top: -2px;
          width: 28px;
          height: 12px;
          border-radius: 15px 15px 8px 5px;
          background: #151a20;
          transform: rotate(-3deg);
        }

        .fp-manager-eye {
          position: absolute;
          top: 13px;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #151a20;
          animation: fp-blink 4.5s infinite;
        }

        .fp-manager-eye.left { left: 8px; }
        .fp-manager-eye.right { right: 8px; }

        @keyframes fp-blink {
          0%,46%,48%,100% { transform: scaleY(1); }
          47% { transform: scaleY(.15); }
        }

        .fp-manager-smile {
          position: absolute;
          left: 11px;
          top: 20px;
          width: 10px;
          height: 5px;
          border-bottom: 1.5px solid #612f28;
          border-radius: 0 0 12px 12px;
        }

        .fp-manager-body {
          position: absolute;
          left: 8px;
          top: 25px;
          width: 43px;
          height: 28px;
          border-radius: 11px 11px 8px 8px;
          background: linear-gradient(180deg, #e95f2d, #923316);
          border: 1px solid rgba(0,0,0,.18);
        }

        .fp-manager-badge {
          position: absolute;
          left: 15px;
          top: 7px;
          width: 15px;
          height: 12px;
          display: grid;
          place-items: center;
          border-radius: 3px;
          background: rgba(255,255,255,.14);
          color: #fff;
          font-size: 5px;
          font-weight: 950;
        }

        .fp-manager-arm {
          position: absolute;
          top: 8px;
          width: 22px;
          height: 6px;
          border-radius: 999px;
          background: #df905f;
        }

        .fp-manager-arm.left {
          left: -12px;
          transform: rotate(23deg);
        }

        .fp-manager-arm.right {
          right: -12px;
          transform: rotate(-23deg);
        }

        .fp-manager-legs {
          position: absolute;
          left: 15px;
          top: 49px;
          display: flex;
          gap: 11px;
        }

        .fp-manager-legs span {
          width: 8px;
          height: 9px;
          border-radius: 0 0 4px 4px;
          background: #242a33;
        }

        /* ==================================================================
           INLINE MESSAGES
           ================================================================== */

        .fp-error {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 9px 10px;
          border: 1px solid rgba(238,118,100,.19);
          border-radius: 10px;
          background: rgba(238,118,100,.065);
          color: #ef9a87;
          font-size: 9px;
          line-height: 1.5;
          font-weight: 700;
          animation: fp-message-in .22s ease both;
        }

        .fp-error-dot {
          width: 6px;
          height: 6px;
          flex: 0 0 6px;
          margin-top: 3px;
          border-radius: 50%;
          background: var(--fp-red);
          box-shadow: 0 0 8px rgba(238,118,100,.46);
        }

        @keyframes fp-message-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ==================================================================
           BUTTONS
           ================================================================== */

        .fp-primary {
          position: relative;
          width: 100%;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          overflow: hidden;
          margin-top: 2px;
          border: 0;
          border-radius: 11px;
          background: linear-gradient(135deg, #ff7540, #df430f);
          color: white;
          cursor: pointer;
          font-family: inherit;
          font-size: 10px;
          font-weight: 850;
          box-shadow: 0 14px 30px rgba(224,68,15,.18);
          transition: transform .2s ease, box-shadow .2s ease, opacity .2s ease;
        }

        .fp-primary::before {
          content: "";
          position: absolute;
          left: -45%;
          top: 0;
          width: 34%;
          height: 100%;
          transform: skewX(-20deg);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.22), transparent);
          transition: left .55s ease;
        }

        .fp-primary:hover::before {
          left: 120%;
        }

        .fp-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 36px rgba(224,68,15,.25);
        }

        .fp-primary:active {
          transform: translateY(0);
        }

        .fp-primary:disabled {
          opacity: .52;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .fp-secondary {
          width: 100%;
          height: 39px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 8px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 10px;
          background: rgba(255,255,255,.025);
          color: #7d8997;
          cursor: pointer;
          font-family: inherit;
          font-size: 9px;
          font-weight: 800;
          transition: .2s ease;
        }

        .fp-secondary:hover {
          border-color: rgba(255,255,255,.13);
          background: rgba(255,255,255,.045);
          color: #d7dce2;
        }

        .fp-secondary:disabled {
          opacity: .45;
          cursor: not-allowed;
        }

        .fp-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,.32);
          border-top-color: #fff;
          border-radius: 50%;
          animation: fp-spin .7s linear infinite;
        }

        @keyframes fp-spin {
          to { transform: rotate(360deg); }
        }

        /* ==================================================================
           OTP TELEMETRY
           ================================================================== */

        .fp-otp-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 6px;
          color: #566271;
          font-size: 8px;
          font-weight: 700;
        }

        .fp-otp-meta strong {
          color: var(--fp-orange-light);
          font-weight: 850;
        }

        /* ==================================================================
           PASSWORD STRENGTH
           ================================================================== */

        .fp-strength {
          padding: 8px 9px;
          border: 1px solid rgba(255,255,255,.055);
          border-radius: 9px;
          background: rgba(255,255,255,.018);
        }

        .fp-strength-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 5px;
        }

        .fp-strength-header span,
        .fp-strength-header strong {
          font-size: 8px;
          font-weight: 750;
        }

        .fp-strength-header span {
          color: #657180;
        }

        .fp-strength-header strong {
          color: #b6bec8;
        }

        .fp-strength-track {
          width: 100%;
          height: 4px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255,255,255,.07);
        }

        .fp-strength-track span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #d84616, #ff9365);
          transition: width .25s ease;
        }

        .fp-password-rules {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 6px;
        }

        .fp-password-rules span {
          padding: 3px 5px;
          border-radius: 5px;
          background: rgba(255,255,255,.035);
          color: #4f5a68;
          font-size: 6px;
          font-weight: 800;
        }

        .fp-password-rules span.ok {
          color: #79ce92;
          background: rgba(117,217,149,.07);
        }

        /* ==================================================================
           SECURITY FOOTER
           ================================================================== */

        .fp-footer-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 12px;
          color: #566170;
          font-size: 8px;
          font-weight: 700;
          line-height: 1.5;
          text-align: center;
        }

        .fp-footer-note svg {
          color: #6e7a88;
        }

        .fp-switch {
          margin: 19px 0 0;
          color: #697482;
          font-size: 9px;
          line-height: 1.5;
          text-align: center;
        }

        .fp-switch a {
          color: #eef1f4;
          font-weight: 800;
          text-decoration: none;
          transition: color .2s ease;
        }

        .fp-switch a:hover {
          color: var(--fp-orange-light);
        }

        .fp-trust {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          margin-top: 17px;
          padding-top: 14px;
          border-top: 1px solid rgba(255,255,255,.05);
          color: #4a5664;
          font-size: 7px;
          font-weight: 750;
          letter-spacing: .05em;
          text-transform: uppercase;
        }

        .fp-trust-item {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .fp-trust-item svg {
          color: #667381;
        }

        .fp-trust-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #3d4753;
        }

        /* ==================================================================
           SUCCESS STATE
           ================================================================== */

        .fp-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 420px;
          text-align: center;
        }

        .fp-success-orbit {
          position: relative;
          width: 112px;
          height: 112px;
          display: grid;
          place-items: center;
          margin-bottom: 21px;
        }

        .fp-success-orbit::before,
        .fp-success-orbit::after {
          content: "";
          position: absolute;
          inset: 0;
          border: 1px solid rgba(117,217,149,.15);
          border-radius: 50%;
          animation: fp-orbit-spin 7s linear infinite;
        }

        .fp-success-orbit::after {
          inset: 11px;
          border-color: rgba(255,102,46,.16);
          animation-duration: 4.5s;
          animation-direction: reverse;
        }

        @keyframes fp-orbit-spin {
          to { transform: rotate(360deg); }
        }

        .fp-success-icon {
          position: relative;
          z-index: 2;
          width: 59px;
          height: 59px;
          display: grid;
          place-items: center;
          border-radius: 19px;
          background: rgba(117,217,149,.09);
          border: 1px solid rgba(117,217,149,.22);
          color: var(--fp-green);
          box-shadow: 0 0 45px rgba(117,217,149,.08);
          animation: fp-success-pop .45s cubic-bezier(.2,.9,.25,1.2) both;
        }

        @keyframes fp-success-pop {
          from { opacity: 0; transform: scale(.65); }
          to { opacity: 1; transform: scale(1); }
        }

        .fp-success h2 {
          margin: 0;
          color: #fff;
          font-size: 29px;
          letter-spacing: -.04em;
          font-weight: 900;
        }

        .fp-success p {
          max-width: 370px;
          margin: 10px 0 0;
          color: #7b8795;
          font-size: 10px;
          line-height: 1.65;
        }

        .fp-success-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 15px;
          padding: 8px 10px;
          border: 1px solid rgba(117,217,149,.12);
          border-radius: 999px;
          background: rgba(117,217,149,.04);
          color: #85cb98;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: .05em;
          text-transform: uppercase;
        }

        .fp-success-login {
          width: min(320px, 100%);
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 18px;
          border: 0;
          border-radius: 11px;
          background: linear-gradient(135deg, #ff7540, #df430f);
          color: white;
          text-decoration: none;
          font-size: 10px;
          font-weight: 850;
          box-shadow: 0 14px 30px rgba(224,68,15,.17);
          transition: .2s ease;
        }

        .fp-success-login:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 36px rgba(224,68,15,.23);
        }

        /* ==================================================================
           MOBILE
           ================================================================== */

        @media (max-width: 1160px) {
          .fp-shell {
            grid-template-columns: minmax(0, 1fr) minmax(390px, .82fr);
            min-height: 740px;
          }

          .fp-visual-copy {
            left: 38px;
            bottom: 210px;
          }

          .fp-panel {
            padding: 38px;
          }
        }

        @media (max-width: 920px) {
          .fp-page {
            padding: 15px;
          }

          .fp-shell {
            grid-template-columns: 1fr;
            max-width: 570px;
            min-height: auto;
          }

          .fp-visual {
            min-height: 355px;
            border-right: 0;
            border-bottom: 1px solid rgba(255,255,255,.07);
          }

          .fp-visual-copy {
            left: 28px;
            right: 28px;
            bottom: 68px;
          }

          .fp-visual-copy h2 {
            font-size: clamp(31px, 7vw, 44px);
          }

          .fp-live-card.a {
            left: 18px;
            top: 96px;
          }

          .fp-live-card.b {
            right: 18px;
            top: 109px;
          }

          .fp-live-card.c {
            right: 24px;
            bottom: 112px;
          }

          .fp-road {
            bottom: 37px;
          }

          .fp-truck-layer {
            bottom: 21px;
          }

          .fp-telemetry {
            bottom: 14px;
            left: 18px;
          }

          .fp-panel {
            padding: 41px 35px 35px;
          }
        }

        @media (max-width: 600px) {
          .fp-page {
            padding: 0;
            align-items: stretch;
          }

          .fp-shell {
            width: 100%;
            min-height: 100vh;
            border: 0;
            border-radius: 0;
          }

          .fp-visual {
            min-height: 286px;
          }

          .fp-topbar {
            top: 16px;
            left: 16px;
            right: 16px;
          }

          .fp-live-status {
            display: none;
          }

          .fp-live-card.b,
          .fp-live-card.c {
            display: none;
          }

          .fp-live-card.a {
            top: 75px;
            left: 17px;
          }

          .fp-visual-copy {
            left: 20px;
            right: 20px;
            bottom: 45px;
          }

          .fp-visual-copy p {
            display: none;
          }

          .fp-panel {
            align-items: flex-start;
            padding: 30px 21px 26px;
          }

          .fp-auth-brand {
            margin-bottom: 22px;
          }

          .fp-heading {
            margin-bottom: 14px;
          }

          .fp-heading h1 {
            font-size: 31px;
          }

          .fp-steps {
            margin-top: 16px;
            margin-bottom: 23px;
          }

          .fp-step {
            gap: 5px;
          }

          .fp-step-label {
            display: none;
          }

          .fp-manager {
            transform: scale(.88);
            transform-origin: bottom right;
          }

          .fp-trust {
            gap: 6px;
            font-size: 6px;
          }
        }

        /* ==================================================================
           REDUCED MOTION
           ================================================================== */

        @media (prefers-reduced-motion: reduce) {
          .fp-orb,
          .fp-live-dot,
          .fp-live-card,
          .fp-road::before,
          .fp-route,
          .fp-truck,
          .fp-wheel,
          .fp-manager,
          .fp-manager-character,
          .fp-manager-eye,
          .fp-success-orbit::before,
          .fp-success-orbit::after,
          .fp-success-icon,
          .fp-spinner {
            animation: none !important;
          }

          .fp-input,
          .fp-primary,
          .fp-secondary,
          .fp-success-login,
          .fp-step-number,
          .fp-switch a {
            transition: none !important;
          }
        }
      `}</style>

      {/* ====================================================================
          PAGE BACKGROUND
          ==================================================================== */}

      <main className="fp-page">
        <div className="fp-grid" aria-hidden="true" />
        <div className="fp-orb a" aria-hidden="true" />
        <div className="fp-orb b" aria-hidden="true" />

        {/* ==================================================================
            MAIN APPLICATION
            ================================================================== */}

        <section className="fp-shell">
          {/* ================================================================
              VISUAL / LOGISTICS SIDE
              ================================================================ */}

          <section className="fp-visual">
            <div className="fp-topbar">
              <div className="fp-brand-pill">
                <div className="fp-brand-mark">
                  S
                </div>

                <span>
                  StockSense
                </span>
              </div>

              <div className="fp-live-status">
                <span className="fp-live-dot" />
                Recovery systems online
              </div>
            </div>

            <div className="fp-live-card a">
              <div className="fp-live-icon">
                <BoxesIcon size={15} />
              </div>

              <div className="fp-live-card-copy">
                <span>
                  Protected inventory
                </span>
                <strong>
                  24,816 units
                </strong>
              </div>

              <i className="fp-live-card-status" />
            </div>

            <div className="fp-live-card b">
              <div className="fp-live-icon">
                <TruckIcon size={15} />
              </div>

              <div className="fp-live-card-copy">
                <span>
                  Logistics network
                </span>
                <strong>
                  128 active routes
                </strong>
              </div>

              <i className="fp-live-card-status" />
            </div>

            <div className="fp-live-card c">
              <div className="fp-live-icon">
                <ActivityIcon size={15} />
              </div>

              <div className="fp-live-card-copy">
                <span>
                  System status
                </span>
                <strong>
                  Stable / encrypted
                </strong>
              </div>

              <i className="fp-live-card-status" />
            </div>

            <div className="fp-visual-copy">
              <div className="fp-kicker">
                <span className="fp-kicker-line" />
                Secure recovery operations
              </div>

              <h2>
                Recover access.
                <br />
                <span>
                  Keep stock moving.
                </span>
              </h2>

              <p>
                Your inventory does not stop when
                a password is forgotten. Recover
                your account securely and get back
                to the warehouse floor.
              </p>
            </div>

            <div className="fp-road" aria-hidden="true" />
            <div className="fp-route" aria-hidden="true" />

            <div className="fp-truck-layer" aria-hidden="true">
              <MovingTruck
                className="one"
                label="Recovery"
              />
              <MovingTruck
                className="two"
                label="Inbound"
              />
              <MovingTruck
                className="three"
                label="Dispatch"
              />
            </div>

            <div className="fp-telemetry">
              <span className="fp-telemetry-dot" />
              LIVE RECOVERY TELEMETRY
              <span>•</span>
              SECURE CHANNEL
            </div>
          </section>

          {/* ================================================================
              AUTH / RECOVERY SIDE
              ================================================================ */}

          <section className="fp-panel">
            <div className="fp-panel-inner">
              <div className="fp-auth-brand">
                <div className="fp-auth-logo">
                  S
                </div>

                <div className="fp-auth-brand-copy">
                  <strong>
                    StockSense
                  </strong>
                  <span>
                    Inventory management
                  </span>
                </div>
              </div>

              {step !== 3 && (
                <>
                  <div className="fp-heading">
                    <div className="fp-heading-kicker">
                      Account recovery dock
                    </div>

                    <h1>
                      {step === 1
                        ? "Forgot your password?"
                        : "Verify and reset."}
                    </h1>

                    <p>
                      {step === 1
                        ? "Enter your email and we’ll send a secure OTP so you can get back into your workspace."
                        : "Enter the OTP and create a fresh password for your StockSense account."}
                    </p>

                    <div className="fp-security">
                      <ShieldIcon size={12} />
                      Secure account recovery
                    </div>
                  </div>

                  <RecoverySteps step={step} />
                </>
              )}

              {step === 1 && (
                <form
                  className="fp-form"
                  onSubmit={handleRequestOtp}
                >
                  <FieldShell
                    label="Email address"
                    icon={MailIcon}
                    field="email"
                    activeField={activeField}
                    setActiveField={setActiveField}
                    typing={managerTyping}
                    error={error}
                  >
                    {({ onFocus, onBlur }) => (
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className="fp-input"
                        placeholder="you@example.com"
                        autoComplete="email"
                        value={email}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        onChange={handleEmailChange}
                        disabled={loading}
                      />
                    )}
                  </FieldShell>

                  {email.length > 0 && (
                    <div
                      style={{
                        marginTop: "-6px",
                        color: emailLooksValid
                          ? "#78c98d"
                          : "#7f6a65",
                        fontSize: "8px",
                        fontWeight: 700,
                      }}
                    >
                      {emailLooksValid
                        ? "✓ Email format looks good."
                        : "Enter a valid email address."}
                    </div>
                  )}

                  {error && (
                    <div className="fp-error" role="alert">
                      <span className="fp-error-dot" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="fp-primary"
                    disabled={loading || !email.trim()}
                  >
                    {loading ? (
                      <>
                        <Spinner />
                        Sending secure OTP...
                      </>
                    ) : (
                      <>
                        Send recovery OTP
                        <ArrowRightIcon size={16} />
                      </>
                    )}
                  </button>

                  <div className="fp-footer-note">
                    <LockIcon size={12} />
                    Your recovery request is protected.
                  </div>
                </form>
              )}

              {step === 2 && (
                <form
                  className="fp-form"
                  onSubmit={handleResetPassword}
                >
                  <div className="fp-email-preview">
                    <div className="fp-email-preview-icon">
                      <MailIcon size={15} />
                    </div>

                    <div className="fp-email-preview-copy">
                      <small>
                        OTP destination
                      </small>
                      <strong>
                        {email}
                      </strong>
                    </div>

                    <button
                      type="button"
                      className="fp-edit-email"
                      onClick={handleBack}
                    >
                      Edit
                    </button>
                  </div>

                  <FieldShell
                    label="Verification code"
                    icon={KeyIcon}
                    field="otp"
                    activeField={activeField}
                    setActiveField={setActiveField}
                    typing={managerTyping}
                    error={error}
                  >
                    {({ onFocus, onBlur }) => (
                      <input
                        id="otp"
                        name="otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        className="fp-input fp-otp-input"
                        placeholder="000000"
                        value={otp}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        onChange={handleOtpChange}
                        disabled={loading}
                      />
                    )}
                  </FieldShell>

                  <div className="fp-otp-meta">
                    <span>
                      Enter the 6-digit code from your email.
                    </span>
                    <strong>
                      {otp.length}/6
                    </strong>
                  </div>

                  <FieldShell
                    label="New password"
                    icon={LockIcon}
                    field="password"
                    activeField={activeField}
                    setActiveField={setActiveField}
                    typing={managerTyping}
                    error={error}
                  >
                    {({ onFocus, onBlur }) => (
                      <div className="fp-password-wrap">
                        <input
                          id="newPassword"
                          name="newPassword"
                          type={showPassword ? "text" : "password"}
                          className="fp-input"
                          placeholder="Create a strong password"
                          autoComplete="new-password"
                          value={password}
                          onFocus={onFocus}
                          onBlur={onBlur}
                          onChange={handlePasswordChange}
                          disabled={loading}
                        />

                        <button
                          type="button"
                          className="fp-eye"
                          onClick={() =>
                            setShowPassword((value) => !value)
                          }
                          disabled={loading}
                          aria-label={
                            showPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          <EyeIcon
                            open={showPassword}
                            size={16}
                          />
                        </button>
                      </div>
                    )}
                  </FieldShell>

                  <PasswordStrength
                    password={password}
                  />

                  <FieldShell
                    label="Confirm password"
                    icon={LockIcon}
                    field="confirmPassword"
                    activeField={activeField}
                    setActiveField={setActiveField}
                    typing={managerTyping}
                    error={error}
                  >
                    {({ onFocus, onBlur }) => (
                      <div className="fp-password-wrap">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          className="fp-input"
                          placeholder="Confirm your password"
                          autoComplete="new-password"
                          value={confirmPassword}
                          onFocus={onFocus}
                          onBlur={onBlur}
                          onChange={handleConfirmPasswordChange}
                          disabled={loading}
                        />

                        <button
                          type="button"
                          className="fp-eye"
                          onClick={() =>
                            setShowConfirmPassword(
                              (value) => !value
                            )
                          }
                          disabled={loading}
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          <EyeIcon
                            open={showConfirmPassword}
                            size={16}
                          />
                        </button>
                      </div>
                    )}
                  </FieldShell>

                  {confirmPassword && (
                    <div
                      style={{
                        marginTop: "-6px",
                        color: passwordsMatch
                          ? "#78c98d"
                          : "#7e6b66",
                        fontSize: "8px",
                        fontWeight: 750,
                      }}
                    >
                      {passwordsMatch
                        ? "✓ Passwords match. Manager approves."
                        : "Passwords must match exactly."}
                    </div>
                  )}

                  {error && (
                    <div className="fp-error" role="alert">
                      <span className="fp-error-dot" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="fp-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner />
                        Securing account...
                      </>
                    ) : (
                      <>
                        Reset my password
                        <ArrowRightIcon size={16} />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="fp-secondary"
                    onClick={handleBack}
                    disabled={loading}
                  >
                    <ArrowLeftIcon size={14} />
                    Back to email
                  </button>
                </form>
              )}

              {step === 3 && (
                <div className="fp-success">
                  <div className="fp-success-orbit">
                    <div className="fp-success-icon">
                      <CheckIcon size={30} />
                    </div>
                  </div>

                  <h2>
                    Password reset.
                  </h2>

                  <p>
                    {success ||
                      "Your password has been reset successfully."}
                  </p>

                  <div className="fp-success-badge">
                    <ShieldIcon size={12} />
                    Account security checkpoint cleared
                  </div>

                  <Link
                    to="/login"
                    className="fp-success-login"
                  >
                    Back to secure login
                    <ArrowRightIcon size={16} />
                  </Link>
                </div>
              )}

              {step !== 3 && (
                <p className="fp-switch">
                  Remember your password?{" "}
                  <Link to="/login">
                    Sign in
                  </Link>
                </p>
              )}

              <div className="fp-trust">
                <span className="fp-trust-item">
                  <ShieldIcon size={9} />
                  Secure recovery
                </span>

                <span className="fp-trust-dot" />

                <span className="fp-trust-item">
                  <LockIcon size={9} />
                  Protected session
                </span>

                <span className="fp-trust-dot" />

                <span className="fp-trust-item">
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
