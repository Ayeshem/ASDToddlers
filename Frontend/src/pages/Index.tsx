import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

const Index = () => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Navigate to="/" replace />;
};

export default Index;
