"use client";

import { useAuth } from "./AuthProvider";
import { AuthLoading } from "./AuthLoading";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return <AuthLoading />;
  }

  return <>{children}</>;
}
