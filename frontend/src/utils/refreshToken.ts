export async function refreshToken(): Promise<string | null> {
  const response = await fetch("http://localhost:3000/api/token", {
    method: "POST",
    credentials: "include",
  });

  const result = await response.json();

  if (result.success) {
    localStorage.setItem("token", result.data);
    return result.data;
  }

  return null;
}
