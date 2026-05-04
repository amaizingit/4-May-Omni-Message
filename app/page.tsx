"use client";

import React, { useState, useEffect } from "react";
import LoginView from "@/src/components/LoginView";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { currentUser } = useAuth();
  const router = useRouter();

  const [appName, setAppName] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("app_name") : null) || "OmniInbox AI");
  const [logoUrl, setLogoUrl] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("app_logo") : null));
  const [users, setUsers] = useState(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("app_users");
    const initialAdmin = {
      id: "admin-1",
      name: "Admin User",
      email: "admin@omniinbox.com",
      phone: "+8801700000000",
      password: "admin123",
      role: "Super Admin",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      joinedDate: "April 02, 2024"
    };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          if (!parsed.find(u => u.email === initialAdmin.email)) return [initialAdmin, ...parsed];
          return parsed;
        }
      } catch (e) {}
    }
    return [initialAdmin];
  });

  useEffect(() => {
    if (currentUser) {
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  if (currentUser) return null;

  return (
    <LoginView 
      appName={appName} 
      logoUrl={logoUrl} 
      users={users} 
      setUsers={setUsers} 
    />
  );
}
