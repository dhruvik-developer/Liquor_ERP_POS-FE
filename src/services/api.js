import axios from "axios";

import { normalizeUrl } from "../utils/url";
import { extractErrorMessage, showErrorToast } from "../utils/toast";

// Ensure this matches your Django backend address, with fallback
// We remove any trailing slashes from the base URL so that we can safely append '/path/'
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.79:8001/api';
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');
const NGROK_SKIP_WARNING_HEADER = "true";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": NGROK_SKIP_WARNING_HEADER,
  },
});

// Request interceptor to attach JWT token, enforce normalized API paths, and log requests
api.interceptors.request.use(
  (config) => {
    // Normalize internal paths to keep exactly one trailing slash and prevent double slashes
    if (config.url) {
      config.url = normalizeUrl(config.url);
    }

    config.headers = config.headers || {};
    config.headers["ngrok-skip-browser-warning"] = NGROK_SKIP_WARNING_HEADER;
    
    // Log the final request URL for debugging 404 issues
    const finalUrl = `${config.baseURL || ''}${config.url || ''}`;
    console.log(`[API Request]: Sending ${config.method?.toUpperCase()} request to -> ${finalUrl}`);
    
    const token = localStorage.getItem("access_token");
    
    // Log headers for debugging
    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[API Request]: Authorization header attached for ${config.url}`);
    } else {
      console.warn(`[API Request]: No valid token found for ${config.url}`);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for catching global errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    // The backend format is { status: true, message: "...", data: {} }
    // We optionally extract it early, but Axios typically wraps in 'data'
    // For safety, we just return the full response to let handlers extract response.data
    return response;
  },
  (error) => {
    if (error?.code !== "ERR_CANCELED" && !error?.config?.skipGlobalErrorToast) {
      showErrorToast(extractErrorMessage(error));
    }

    if (error.response && error.response.status === 401) {
      // Token exists but is invalid/expired
      if (localStorage.getItem("access_token")) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_data");
        window.location.href = "/login"; // Force re-login
      }
    }
    return Promise.reject(error);
  },
);

export default api;
