const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

export async function apiRequest(
  endpoint,
  options = {}
) {
  const token =
    localStorage.getItem("access_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,
        headers,
      }
    );
  } catch (error) {
    throw new Error(
      "Unable to connect to the StockSense server."
    );
  }

  const contentType =
    response.headers.get("content-type");

  let data = {};

  if (
    contentType &&
    contentType.includes("application/json")
  ) {
    data = await response.json().catch(() => ({}));
  } else {
    data = await response.text().catch(() => "");
  }

  if (!response.ok) {
    let message = "Something went wrong. Please try again.";
    
    if (typeof data === "object" && data !== null) {
      if (Array.isArray(data.detail)) {
        // FastAPI validation errors
        message = data.detail.map(err => err.msg).join(", ");
      } else if (data.detail) {
        message = data.detail;
      } else if (data.message) {
        message = data.message;
      }
    } else if (typeof data === "string" && data) {
      message = data;
    }

    throw new Error(message);
  }

  return data;
}