import { JSX } from "react";

import { Navigate } from "react-router-dom";
import { AuthLoading } from "./ui/loading/AuthLoading";
import { useAuth } from "@/contexts/AuthContext";

export function PublicRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <AuthLoading />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-md mx-auto min-h-screen bg-white dark:bg-slate-950 shadow-2xl relative transition-colors pb-32">
        {children}
      </div>
    </div>
  );
}
