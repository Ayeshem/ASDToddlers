import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { LogOut, User, Home, Users, Settings, Calendar, Video, BarChart3, Eye, Loader2 } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function DashboardHeader() {
  const { user, logout, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getNavItems = () => {
    const baseItems = [
      { to: "/appointments", label: "Appointments", icon: Calendar },
    ];

    switch (user?.role) {
      case 'parent':
        return [
          { to: "/parent-dashboard", label: "Dashboard", icon: Home },
          { to: "/view-stimuli-library", label: "Stimuli", icon: Video },
          ...baseItems,
        ];
      case 'doctor':
        return [
          { to: "/doctor-dashboard", label: "Dashboard", icon: Home },
          { to: "/stimuli-library", label: "Stimuli", icon: Video },
          ...baseItems,
        ];
      case 'admin':
        return [
          { to: "/admin-dashboard", label: "Dashboard", icon: Home },
          { to: "/view-stimuli-library", label: "Stimuli", icon: Video },
          ...baseItems,
        ];
      default:
        return baseItems;
    }
  };

  const navItems = getNavItems();

  return (
    <header className="bg-gradient-primary border-b border-border/20 px-6 py-4 shadow-modern-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div>
            <h1 className="text-xl font-bold text-white">
              Autism Detection Platform
            </h1>
            <p className="text-xs text-white/80 capitalize">
              {user?.role} Dashboard
            </p>
          </div>
          
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    isActive 
                      ? 'bg-white/20 text-white font-medium shadow-modern-sm backdrop-blur-sm' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-white/90">
            <User className="h-4 w-4" />
            <span>{user?.name}</span>
          </div>
          
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleLogout} 
            disabled={isLoading}
            className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4 mr-2" />
            )}
            {isLoading ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>
    </header>
  );
}