// import { Button } from "@/components/ui/button";
// import { useAuthStore } from "@/store/authStore";
// import { LogOut, User, Home, Users, Settings, Calendar, Video, BarChart3, Eye, Loader2 } from "lucide-react";
// import { useNavigate, useLocation, Link } from "react-router-dom";
// import { useToast } from "@/hooks/use-toast";

// export function DashboardHeader() {
//   const { user, logout, isLoading } = useAuthStore();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { toast } = useToast();

//   const handleLogout = async () => {
//     try {
//       await logout();
//       toast({
//         title: "Logged out successfully",
//         description: "You have been logged out of your account.",
//       });
//       navigate("/login");
//     } catch (error) {
//       toast({
//         title: "Logout failed",
//         description: "There was an error logging out. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };

//   const getNavItems = () => {
//     const baseItems = [];

//     switch (user?.role) {
//       case 'parent':
//         return [
//           { to: "/parent-dashboard", label: "Dashboard", icon: Home },
//           { to: "/view-stimuli-library", label: "Stimuli", icon: Video },
//           { to: "/appointments", label: "Appointments", icon: Calendar },
//           ...baseItems,
//         ];
//       case 'doctor':
//         return [
//           { to: "/doctor-dashboard", label: "Dashboard", icon: Home },
//           { to: "/stimuli-library", label: "Stimuli", icon: Video },
//           { to: "/view-appointments", label: "Appointments", icon: Video },
//           ...baseItems,
//         ];
//       case 'admin':
//         return [
//           { to: "/admin-dashboard", label: "Dashboard", icon: Home },
//           { to: "/view-stimuli-library", label: "Stimuli", icon: Video },
//           { to: "/view-appointments", label: "Appointments", icon: Video },
//           ...baseItems,
//         ];
//       default:
//         return baseItems;
//     }
//   };

//   const navItems = getNavItems();

//   return (
//     <header className="bg-gradient-primary border-b border-border/20 px-6 py-4 shadow-modern-md">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-8">
//           <div>
//             <h1 className="text-xl font-bold text-white">
//               Autism Detection Platform
//             </h1>
//             <p className="text-xs text-white/80 capitalize">
//               {user?.role} Dashboard
//             </p>
//           </div>
          
//           <nav className="hidden md:flex items-center gap-1">
//             {navItems.map((item) => {
//               const Icon = item.icon;
//               const isActive = location.pathname === item.to;
//               return (
//                 <Link
//                   key={item.to}
//                   to={item.to}
//                   className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
//                     isActive 
//                       ? 'bg-white/20 text-white font-medium shadow-modern-sm backdrop-blur-sm' 
//                       : 'text-white/70 hover:text-white hover:bg-white/10'
//                   }`}
//                 >
//                   <Icon className="h-4 w-4" />
//                   {item.label}
//                 </Link>
//               );
//             })}
//           </nav>
//         </div>
        
//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-2 text-sm text-white/90">
//             <User className="h-4 w-4" />
//             <span>{user?.name}</span>
//           </div>
          
//           <Button 
//             variant="secondary" 
//             size="sm" 
//             onClick={handleLogout} 
//             disabled={isLoading}
//             className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm"
//           >
//             {isLoading ? (
//               <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//             ) : (
//               <LogOut className="h-4 w-4 mr-2" />
//             )}
//             {isLoading ? "Logging out..." : "Logout"}
//           </Button>
//         </div>
//       </div>
//     </header>
//   );
// }
// src/components/layout/DashboardHeader.tsx




//me likery
import { Link, useLocation, useNavigate } from "react-router-dom";
// Assuming a standard project structure, aliased paths are replaced with relative paths
import { useAuthStore } from "../../store/authStore";
import { useToast } from "../../hooks/use-toast";
import { cn } from "../../lib/utils";

// UI Components
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";

// Icons - Added Eye icon
import {
  LogOut, User, Home, Settings, Calendar, Video, BarChart3,
  Users, Loader2, Menu, Eye, FileText,
  Paperclip, // Changed BrainCircuit to Eye
} from "lucide-react";

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
    const baseDashboardPath = `/${user?.role}-dashboard`;
    switch (user?.role) {
      case 'parent':
        return [
          { to: baseDashboardPath, label: "Dashboard", icon: Home },
          { to: "/view-stimuli-library", label: "Stimuli Library", icon: Video },
          { to: "/appointments", label: "Appointments", icon: Calendar },
        ];
      case 'doctor':
        return [
          { to: baseDashboardPath, label: "Dashboard", icon: Home },
          { to: "/stimuli-library", label: "Stimuli Library", icon: Video },
          { to: "/view-appointments", label: "Appointments", icon: Calendar },
        ];
      case 'admin':
        return [
          { to: baseDashboardPath, label: "Dashboard", icon: Home },
          { to: "/view-doctors", label: "Doctors", icon: User },
          { to: "/view-assessments", label: "Assessments", icon: Paperclip },
          { to: "/stimuli-management", label: "Stimuli", icon: Video },
          { to: "/view-appointments", label: "Appointments", icon: Calendar },
          { to: "/system", label: "System", icon: Settings },
          // { to: "/system-logs", label: "System Logs", icon: FileText },
          // { to: "/manage-users", label: "Manage Users", icon: Users },
          // { to: "/system-settings", label: "Settings", icon: Settings },
        ];
      default: return [];
    }
  };

  const navItems = getNavItems();

  return (
    // Lighter color palette: from slate-900 to slate-800
    <header className="sticky top-0 z-50 bg-slate-700 text-slate-50 border-b border-slate-600/60 shadow-lg">
      <div className="container mx-auto flex h-16 items-center justify-between">
        {/* === Left Section: Logo & Desktop Navigation === */}
        <div className="flex items-center gap-8">
          <Link to={`/${user?.role}-dashboard`} className="flex items-center gap-2.5">
            {/* Swapped BrainCircuit for Eye icon */}
            <Eye className="h-7 w-7 text-sky-100" />
            <span className="text-lg font-bold tracking-tight">
              Autism Platform
            </span>
          </Link>
          
          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    // Adjusted text and hover colors for the new background
                    "text-slate-300 hover:bg-slate-600 hover:text-white",
                    isActive && "bg-slate-600 text-sky-100"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* === Right Section: User Menu & Mobile Nav Trigger === */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {/* Adjusted hover and ring colors for lighter theme */}
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-slate-700 focus-visible:ring-sky-400 focus-visible:ring-offset-slate-800">
                <Avatar className="h-9 w-9 border-2 border-slate-500">
                  {/* <AvatarImage src={user?.avatarUrl} alt={user?.name} /> */}
                  <AvatarFallback className="bg-slate-600 text-slate-300">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            {/* Adjusted dropdown colors */}
            <DropdownMenuContent className="w-56 bg-slate-700 border-slate-600 text-slate-200" align="end" forceMount>
               <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-slate-400">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-600" />
              <DropdownMenuItem onClick={handleLogout} disabled={isLoading} className="focus:bg-red-900/50 focus:text-white">
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <LogOut className="mr-2 h-4 w-4" />
                )}
                <span>{isLoading ? "Logging out..." : "Log out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="md:hidden">
            {/* Mobile sheet can be added here if needed */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 md:hidden bg-transparent border-slate-600 hover:bg-slate-700 hover:text-white">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col bg-slate-800 text-white border-r-slate-600 p-0">
                    <nav className="grid gap-2 p-4 text-lg font-medium">
                        <Link
                            to="#"
                            className="flex items-center gap-2 text-lg font-semibold mb-4 border-b border-slate-600 pb-4"
                        >
                            <Eye className="h-6 w-6 text-sky-400" />
                            <span>Autism Platform</span>
                        </Link>
                        {navItems.map((item) => (
                           <Link
                            key={item.to}
                            to={item.to}
                            className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700"
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
