// src/pages/Signup.tsx

import { Link } from "react-router-dom";
import { SignupForm } from "@/components/auth/signup-form";
// Removed: import { Mountain } from "lucide-react";

export default function Signup() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-cyan-100 to-blue-200 p-4">
      {/*
        Removed the logo div.
        Changed max-w-md to max-w-lg to increase the width.
        You can try max-w-xl or even a specific width like w-[480px] if max-w-lg/xl isn't enough.
      */}
      <div 
        className="w-full max-w-lg space-y-6 bg-white/40 backdrop-blur-lg rounded-2xl shadow-lg border border-white/60 p-8 animate-fade-in"
      >
        {/*
          Removed this section:
          <div className="flex justify-center">
            <Mountain className="h-10 w-10 text-slate-700" />
          </div>
        */}
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800">
            Create Your Account
          </h1>
          <p className="text-slate-600">
            Welcome! Please fill in the details to join.
          </p>
        </div>
        
        <SignupForm />
        
        <div className="text-center">
          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-blue-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}