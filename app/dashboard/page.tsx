"use client";

import AppClient from "@/src/AppClient";
import { useAuth } from "@/src/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const saved = localStorage.getItem("current_user");
    if (!saved && !currentUser) {
      router.push("/");
    }
  }, [currentUser, router]);

  if (!currentUser) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
    </div>
  );

  return <AppClient />;
}
