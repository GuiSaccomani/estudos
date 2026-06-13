"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { LoginModal } from "./auth/LoginModal";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  requireLogin: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  requireLogin: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleAuthRequired = () => {
      setShowLoginModal(true);
    };

    window.addEventListener("auth-required", handleAuthRequired);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
      
      // Se logou com sucesso e o modal estava aberto, fechamos.
      if (session?.user && showLoginModal) {
        setShowLoginModal(false);
      }
    });

    return () => {
      window.removeEventListener("auth-required", handleAuthRequired);
      subscription.unsubscribe();
    };
  }, [showLoginModal]);

  const requireLogin = () => {
    if (!user) {
      setShowLoginModal(true);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, requireLogin }}>
      {children}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </AuthContext.Provider>
  );
}
