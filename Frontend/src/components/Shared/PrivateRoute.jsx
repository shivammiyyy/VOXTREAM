import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-10">Loading...</div>;

  return user ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
