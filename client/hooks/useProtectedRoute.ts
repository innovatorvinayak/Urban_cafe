import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useProtectedRoute() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated;
}

export function useRoleProtection(allowedRoles: string[]) {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    if (user && !allowedRoles.includes(user.role)) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, allowedRoles, navigate]);

  return isAuthenticated && (user ? allowedRoles.includes(user.role) : false);
}
