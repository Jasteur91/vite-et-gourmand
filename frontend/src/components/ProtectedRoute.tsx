import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type AuthUser } from '../contexts/AuthContext';

type Props = {
  children: React.ReactNode;
  roles?: Array<AuthUser['role']>;
};

export function ProtectedRoute({ children, roles }: Props) {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to={`/auth/login?next=${encodeURIComponent(loc.pathname)}`} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
}
