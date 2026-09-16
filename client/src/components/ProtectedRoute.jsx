import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16]">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (requiredRole === 'admin') return <Navigate to="/admin/login" replace />;
    if (requiredRole === 'scorer' || (Array.isArray(requiredRole) && requiredRole.includes('scorer'))) {
      return <Navigate to="/scorer/login" replace />;
    }
    return <Navigate to="/" replace />;
  }

  if (requiredRole) {
    const isAllowed = Array.isArray(requiredRole)
      ? requiredRole.includes(user?.role)
      : user?.role === requiredRole;

    if (!isAllowed) {
      if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
      if (user?.role === 'scorer') return <Navigate to="/scorer/dashboard" replace />;
      return <Navigate to="/participant/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
