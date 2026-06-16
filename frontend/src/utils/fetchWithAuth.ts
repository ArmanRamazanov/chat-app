import router from "../router";
import { refreshToken } from "./refreshToken";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!result.success && result.data?.code === "TOKEN_EXPIRED") {
    const newToken = await refreshToken();

    if (!newToken) {
      router.navigate("/login");
      return null;
    }

    const retryResponse = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${newToken}`,
      },
    });

    return retryResponse.json();
  }

  // if token invalid, go to login immediately
  if (!result.success && result.data?.code === "TOKEN_INVALID") {
    router.navigate("/login");
    return null;
  }

  return result;
}
