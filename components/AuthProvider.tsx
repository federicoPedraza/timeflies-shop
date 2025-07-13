"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useNavigationLoading } from "@/hooks/use-navigation-loading";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  logout: () => void;
  makeAuthenticatedRequest: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useNavigationLoading();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const storedUserId = localStorage.getItem("tiendanube_user_id");

      if (storedUserId) {
        setUserId(storedUserId);
        setIsAuthenticated(true);
      } else {
        // Only redirect if not already on the callback page
        if (pathname !== "/tiendanube/callback") {
          router.push("/api/tiendanube/authorize");
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router, pathname]);

  const logout = async () => {
    // Delete credentials from Convex if user is authenticated
    if (userId) {
      try {
        const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
        if (convexUrl) {
          const convex = new ConvexHttpClient(convexUrl);
          await convex.mutation(api.auth.deleteUserCredentials, { user_id: userId });
          console.log(`✅ [Auth] Deleted credentials for user: ${userId}`);
        }
      } catch (error) {
        console.error(`❌ [Auth] Error deleting credentials for user ${userId}:`, error);
      }
    }

    // Clear localStorage
    localStorage.removeItem("tiendanube_user_id");
    localStorage.removeItem("tiendanube_business_id");

    // Reset state
    setIsAuthenticated(false);
    setUserId(null);

    // Redirect to authorization
    router.push("/api/tiendanube/authorize");
  };

  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const headers = {
      ...options.headers,
      'x-tiendanube-user-id': userId,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  };

  const value = {
    isAuthenticated,
    isLoading,
    userId,
    logout,
    makeAuthenticatedRequest,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
