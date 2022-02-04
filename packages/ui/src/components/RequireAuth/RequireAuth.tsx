import { Navigate, useLocation } from 'react-router-dom';

import useAuth from 'hooks/useAuth';

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const { username } = useAuth();
  const location = useLocation();

  if (!username) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
