import { Link } from "react-router-dom";
import { LoginForm } from "@/components/auth/login-form";
import { useAuthStore } from "@/store/authStore";

export default function Login() {
  const { isAuthenticated, user } = useAuthStore();

  return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(220,80%,92%)] to-[hsl(158,70%,88%)] p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Autism Detection Platform
          </h1>
          <p className="text-muted-foreground">
            Early screening through eye-tracking analysis
          </p>
        </div>
        
        <LoginForm />
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        {/* Debug information - remove in production */}
        {import.meta.env.DEV && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs">
            <p><strong>Debug Info:</strong></p>
            <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
            <p>User: {user ? `${user.name} (${user.role})` : 'None'}</p>
            <p>Email: {user?.email || 'None'}</p>
          </div>
        )}
      </div>
    </div>
  );
}