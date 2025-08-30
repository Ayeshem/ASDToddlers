import { Link } from "react-router-dom";
import { SignupForm } from "@/components/auth/signup-form";

export default function Signup() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(220,80%,92%)] to-[hsl(158,70%,88%)] p-4">
    <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Join Our Platform
          </h1>
          <p className="text-muted-foreground">
            Create an account to get started
          </p>
        </div>
        
        <SignupForm />
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}