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
    const message =
      typeof data === "object"
        ? data?.detail
        : data;

    throw new Error(
      message ||
        "Something went wrong. Please try again."
    );
  }

  return data;
}