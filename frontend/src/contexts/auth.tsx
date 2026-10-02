import { createContext, useCallback, useContext, useState, useEffect, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@/types";

interface Auth {
  user: User | null; 
  loading: boolean;
  unlock: (code: string) => boolean;
  logout: () => void;
}
const Ctx = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('access_code') === 'DUR@0730');

  const dummyUser: User = {
    id: 1,
    name: "Workspace",
    email: "workspace@local.com",
    avatar_url: null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const clear = useCallback(() => { 
    sessionStorage.removeItem('access_code');
    setUnlocked(false);
    qc.clear(); 
  }, [qc]);

  useEffect(() => { 
    window.addEventListener("myday:logout", clear); 
    return () => window.removeEventListener("myday:logout", clear); 
  }, [clear]);

  const value: Auth = {
    user: unlocked ? dummyUser : null,
    loading: false,
    unlock: (code: string) => {
      if (code === "DUR@0730") {
        sessionStorage.setItem('access_code', code);
        setUnlocked(true);
        return true;
      }
      return false;
    },
    logout: clear,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() { 
  const c = useContext(Ctx); 
  if (!c) throw new Error("useAuth outside AuthProvider"); 
  return c; 
}
