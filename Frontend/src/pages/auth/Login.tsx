// src/pages/Login.tsx

import { Link } from "react-router-dom";
import { LoginForm } from "@/components/auth/login-form";

export default function Login() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-sky-100 to-indigo-200 p-4">
      {/* Glassmorphism Card */}
      <div
        className="w-full max-w-lg space-y-6 bg-white/40 backdrop-blur-lg rounded-2xl shadow-lg border border-white/60 p-8 animate-fade-in"
      >
        {/* Logo has been added here */}
        {/* <div className="flex justify-center mb-4">
          <img src="/favicon.ico" alt="Platform Logo" className="h-16 w-16" />
        </div> */}

        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800">
            Autism Detection Platform
          </h1>
          <p className="text-slate-600">
            Sign in to access your dashboard
          </p>
        </div>
        
        <LoginForm />
        
        <div className="text-center">
          <p className="text-sm text-slate-600">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-indigo-600 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}