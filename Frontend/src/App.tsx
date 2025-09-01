import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

// Auth pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

// Dashboard pages
import ParentDashboard from "./pages/parent/ParentDashboard";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Feature pages
import AssessmentReport from "./pages/reports/AssessmentReport";
import ResultsBrowser from "./pages/reports/ResultsBrowser";
import StimuliLibrary from "./pages/stimuli/StimuliLibrary";
import ViewStimuliLibrary from "./pages/stimuli/ViewStimuliLibrary";
import GazeSession from "./pages/session/GazeSession";
import AppointmentScheduler from "./pages/appointments/AppointmentScheduler";
import ViewAppointment from "./pages/appointments/ViewAppointment";

// Other pages
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

function AppRoutes() {
  const { isAuthenticated, user, isLoading, checkAuthStatus } = useAuthStore();

  useEffect(() => {
    // Check authentication status on app load
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="Loading application..." />
      </div>
    );
  }

  // Helper function to get the appropriate dashboard route
  const getDashboardRoute = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'parent':
        return '/parent-dashboard';
      case 'doctor':
        return '/doctor-dashboard';
      case 'admin':
        return '/admin-dashboard';
      default:
        return '/login';
    }
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={
          !isAuthenticated ? (
            <Login />
          ) : (
            <Navigate to={getDashboardRoute()} replace />
          )
        } 
      />
      <Route 
        path="/signup" 
        element={
          !isAuthenticated ? (
            <Signup />
          ) : (
            <Navigate to={getDashboardRoute()} replace />
          )
        } 
      />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Root redirect based on authentication and role */}
      <Route
        path="/"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : (
            <Navigate to={getDashboardRoute()} replace />
          )
        }
      />

      {/* Protected routes */}
      <Route
        path="/parent-dashboard"
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor-dashboard"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Feature routes */}
      <Route
        path="/assessment-report"
        element={
          <ProtectedRoute allowedRoles={['parent', 'doctor', 'admin']}>
            <AssessmentReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/results"
        element={
          <ProtectedRoute allowedRoles={['parent', 'doctor', 'admin']}>
            <ResultsBrowser />
          </ProtectedRoute>
        }
      />
      {/* Parametrized report route used by GazeSession navigation */}
      <Route
        path="/reports/:childId"
        element={
          <ProtectedRoute allowedRoles={['parent', 'doctor', 'admin']}>
            <AssessmentReport />
          </ProtectedRoute>
        }
      />

      <Route
        path="/stimuli-library"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <StimuliLibrary />
          </ProtectedRoute>
        }
      />

      <Route
          path="/view-stimuli-library"
          element={
            <ProtectedRoute allowedRoles={['parent', 'admin']}>
                  <ViewStimuliLibrary />
                  </ProtectedRoute>
                }
              />

      <Route
        path="/gaze-session/:childId"
        element={
          <ProtectedRoute allowedRoles={['parent', 'doctor', 'admin']}>
            <GazeSession />
          </ProtectedRoute>
        }
      />

      <Route
        path="/appointments"
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <AppointmentScheduler />
          </ProtectedRoute>
        }
      />

      <Route
        path="/view-appointments"
        element={
          <ProtectedRoute allowedRoles={['doctor', 'admin']}>
            <ViewAppointment />
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <>
    <AppRoutes />
    <Toaster />
    <Sonner />
  </>
);

export default App;
