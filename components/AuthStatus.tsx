"use client";

import { useAuth } from "./AuthProvider";
import { Badge } from "./ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

export function AuthStatus() {
  const { isAuthenticated, isLoading, userId } = useAuth();

  if (isLoading) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <div className="animate-spin rounded-full h-3 w-3 border-b border-current" />
        Checking...
      </Badge>
    );
  }

  if (isAuthenticated) {
    return (
      <Badge variant="default" className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Connected
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="flex items-center gap-1">
      <XCircle className="h-3 w-3" />
      Not Connected
    </Badge>
  );
}
