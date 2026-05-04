"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "Super Admin" | "Executive";
  avatar: string;
  joinedDate: string;
}

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem("current_user");
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem("current_user");
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && !currentUser && pathname !== "/") {
      // Option to auto-redirect if unauthorized, but keep it flexible for now
      // router.push("/");
    }
  }, [isLoading, currentUser, pathname]);

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("current_user");
    router.push("/");
  };

  const handleSetUser = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem("current_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("current_user");
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser: handleSetUser, logout }}>
      {!isLoading ? children : (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
