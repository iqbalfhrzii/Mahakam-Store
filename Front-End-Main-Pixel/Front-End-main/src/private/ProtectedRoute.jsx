/* eslint-disable react/prop-types */
import { Navigate } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const authToken = localStorage.getItem("authToken");
  const { userRole } = useUserContext();

  if (!authToken) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
