"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { MessageSquare, ChevronLeft, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { supabase, isSupabaseConfigured } from "@/src/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginView({ 
  appName, 
  logoUrl,
  users,
  setUsers
}: { 
  appName: string, 
  logoUrl: string | null,
  users: any[],
  setUsers: any
}) {
  const { setCurrentUser } = useAuth();
  const router = useRouter();

  const [loginError, setLoginError] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginTab, setLoginTab] = useState<"Super Admin" | "Executive">("Super Admin");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const email = loginEmail.trim();
    const password = loginPassword;

    // First try local users (from memory/initial)
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (!user && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('app_users')
          .select('*')
          .ilike('email', email)
          .eq('password', password)
          .maybeSingle();
        
        if (data) {
          user = data;
          setUsers((prev: any) => {
            if (!prev.find((u: any) => u.id === data.id)) {
              return [...prev, data];
            }
            return prev;
          });
        }
      } catch (err) {
        console.error("Supabase login check error:", err);
      }
    }

    if (user) {
      if (user.role !== loginTab) {
        setLoginError(`This account is not registered as a ${loginTab}.`);
        return;
      }
      setCurrentUser(user);
      router.push("/dashboard");
    } else {
      setLoginError("Invalid email or password. Please try again.");
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const email = resetEmail.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === email);
    if (user) {
      setResetMessage(`Password for ${resetEmail} is: ${user.password}`);
    } else {
      setResetMessage("Email not found in our records.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 font-sans">
      <div className="flex flex-col items-center mb-8">
        {logoUrl ? (
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-slate-700 shadow-xl mb-4">
            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        ) : (
          <div className="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center border border-slate-700 shadow-xl mb-4">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
        )}
        <h2 className="text-slate-200 font-bold text-xl tracking-tight uppercase">{appName}</h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[#1e2d45] w-full max-w-lg rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] p-12 border border-slate-700/50"
      >
        {showForgotPassword ? (
          <>
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => { setShowForgotPassword(false); setResetMessage(""); }}
                className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Reset Password</h1>
                <p className="text-slate-400 text-sm font-medium">Enter your email to verify account.</p>
              </div>
            </div>

            {resetMessage && (
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${resetMessage.includes('is:') ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}`}>
                {resetMessage.includes('is:') ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <p className="text-xs font-bold uppercase tracking-wider">{resetMessage}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleForgotPassword}>
              <div>
                <label className="block text-slate-300 font-bold text-sm mb-2" htmlFor="reset-email">
                  Email Address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#0f172a] border border-slate-700 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-600"
                  placeholder="Enter your registered email"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0a946b] hover:bg-[#08835d] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/10 active:scale-[0.98] uppercase tracking-wider text-sm mt-4"
              >
                Verify Email
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="flex bg-[#0f172a] p-1 rounded-2xl mb-8 border border-slate-700/50">
              <button
                onClick={() => { setLoginTab("Super Admin"); setLoginError(""); }}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${loginTab === "Super Admin" ? 'bg-[#0a946b] text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Super Admin
              </button>
              <button
                onClick={() => { setLoginTab("Executive"); setLoginError(""); }}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${loginTab === "Executive" ? 'bg-[#0a946b] text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Employee
              </button>
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-slate-400 mb-6 font-medium">Sign in as <span className="text-emerald-400 font-bold">{loginTab}</span> to access your dashboard.</p>
            
            <div className="mb-8 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl relative group">
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1">Demo Access</p>
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-400 font-medium">
                  {loginTab === "Super Admin" 
                    ? "Email: admin@omniinbox.com | Pass: admin123" 
                    : "Create an Executive account first in Admin Panel."}
                </p>
                {loginTab === "Super Admin" && (
                  <button 
                    type="button"
                    onClick={() => {
                      setLoginEmail("admin@omniinbox.com");
                      setLoginPassword("admin123");
                    }}
                    className="text-[10px] bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 px-2 py-1 rounded transition-colors font-bold uppercase"
                  >
                    Fill
                  </button>
                )}
              </div>
            </div>

            {loginError && (
              <div className="mb-6 space-y-2">
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">{loginError}</p>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label className="block text-slate-300 font-bold text-sm mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#0f172a] border border-slate-700 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-600"
                  placeholder="name@company.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-slate-300 font-bold text-sm" htmlFor="password">
                    Password
                  </label>
                  <button 
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#0f172a] border border-slate-700 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-600 pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0a946b] hover:bg-[#08835d] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/10 active:scale-[0.98] uppercase tracking-wider text-sm mt-4"
              >
                Log In
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
