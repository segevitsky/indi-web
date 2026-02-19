import { useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, onAuthStateChange } from './supabase/auth';
import type { User } from '@supabase/supabase-js';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check existing session first (handles page refresh)
    const checkSession = async () => {
      const session = await getSession();
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate('/login');
      }
      setIsLoading(false);
    };

    checkSession();

    // Then subscribe to future auth changes (handles sign-out, token refresh)
    const { data: { subscription } } = onAuthStateChange((authUser) => {
      if (!authUser) {
        navigate('/login');
      } else {
        setUser(authUser);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-50 to-rose-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
