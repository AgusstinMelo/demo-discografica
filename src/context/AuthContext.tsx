import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, type Session } from "../lib/api";

interface AuthValue {
  session: Session | null;
  /** false mientras se comprueba si había una sesión abierta */
  ready: boolean;
  signIn: (email: string, password: string) => Promise<Session>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api.getSession().then(setSession).finally(() => setReady(true));
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const s = await api.signIn(email, password);
    setSession(s);
    return s;
  }, []);

  const signOut = useCallback(async () => {
    await api.signOut();
    setSession(null);
  }, []);

  const value = useMemo(() => ({ session, ready, signIn, signOut }), [session, ready, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
