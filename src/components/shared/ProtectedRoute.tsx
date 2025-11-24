import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import authStore from "../../store/authStore";
import type { UserRole } from "../../lib/types";

type Props = {
  allowedRoles: UserRole[];
  children: ReactNode;
};

export const ProtectedRoute = ({ allowedRoles, children }: Props) => {
  const user = authStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

