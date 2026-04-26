// Google OAuth Integration Service
// This service handles Google authentication

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  image?: string;
}

export const googleAuthConfig = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
  redirectUri: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/google/callback`
};

export const initGoogleAuth = () => {
  if (!googleAuthConfig.clientId) {
    console.warn("Google Client ID is not configured");
    return false;
  }

  // Load Google SDK
  const script = document.createElement("script");
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.defer = true;
  document.body.appendChild(script);

  return true;
};

export const loginWithGoogle = (token: string) => {
  // Send token to backend for verification
  return fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token })
  }).then(res => res.json());
};

export const signupWithGoogle = (token: string, name?: string) => {
  // Send token to backend for verification
  return fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/google/signup`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, name })
    }
  ).then(res => res.json());
};
