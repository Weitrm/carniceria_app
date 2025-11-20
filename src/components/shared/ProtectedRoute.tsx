import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

export const ProtectedRoute = ({ allowedRoles, children }) => {
  const user = useAuthStore(state => state.user);

  if (!user) return <Navigate to="/login" />;

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }

  return children;
}
