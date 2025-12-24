import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

const RequireAuth = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const location = useLocation();

  // Not logged in -> send to login
  if (!isAuthenticated || !token) {
    return (
      <Navigate
        to="/MyAccountSignIn"
        state={{ from: location }} 
        replace
      />
    );
  }

  return children;
};

export default RequireAuth;
