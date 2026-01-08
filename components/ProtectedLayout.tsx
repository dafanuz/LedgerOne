import { JSX } from "react";

import { Navigate } from "react-router-dom";
import { AuthLoading } from "./ui/loading/AuthLoading";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "./Layout";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <AuthLoading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}
