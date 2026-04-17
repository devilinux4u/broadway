// API configuration and base service

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://:2000/api/v1";

export const getAuthToken = (): string | null => {
  return localStorage.getItem("adminToken");
};

export const getUserAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem("adminToken", token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem("adminToken");
};

export const getHeaders = (useUserToken: boolean = false): Record<string, string> => {
  const token = useUserToken ? getUserAuthToken() : getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    // ngrok warning - skip browser warning for ngrok tunnels
    'ngrok-skip-browser-warning': 'true'
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

export const apiCall = async (
  endpoint: string,
  options: RequestInit = {},
  useUserToken: boolean = false
): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getHeaders(useUserToken);

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      if (useUserToken) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        window.location.href = "/auth";
      } else {
        removeAuthToken();
        // Check if this is a user auth endpoint or admin endpoint
        if (endpoint.includes("/admin/")) {
          window.location.href = "/admin/login";
        } else if (endpoint.includes("/auth/")) {
          window.location.href = "/auth";
        }
      }
    }

    const error = await response.json().catch(() => ({
      error: response.statusText,
    }));
    throw new Error(error.error || `API Error: ${response.status}`);
  }

  return response.json();
};

export default apiCall;
