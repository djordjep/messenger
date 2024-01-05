import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "./UserContext"; // Path to your UserContext

export default function ProtectedRoute({ children }) {
  const { user } = useUser();
  const location = useLocation();

  if (!user?.token) {
    // Replace `user?.token` with your token state check
    // Redirect them to the login page, but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
