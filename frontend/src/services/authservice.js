import { apiRequest } from "./api";

export async function loginUser(email, password) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

export async function signupUser(name, email, password, role = "warehouse_staff") {
  return apiRequest("/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      role,
    }),
  });
}

export async function googleLogin(idToken) {
  return apiRequest("/auth/google", {
    method: "POST",
    body: JSON.stringify({
      id_token: idToken,
    }),
  });
}

export async function requestPasswordReset(email) {
  return apiRequest("/auth/request-password-reset", {
    method: "POST",
    body: JSON.stringify({
      email,
    }),
  });
}

export async function resetPassword(email, otp, newPassword) {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({
      email,
      otp,
      new_password: newPassword,
    }),
  });
}

export async function getCurrentUser() {
  return apiRequest("/users/me");
}

export function logoutUser() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user_data");
}

export function getToken() {
  return localStorage.getItem("access_token");
}

export function isAuthenticated() {
  return !!localStorage.getItem("access_token");
}