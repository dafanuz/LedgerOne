import authService from "@/services/authService";
import { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

// Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

   const refreshProfile = async () => {
    if (session?.user?.id) {
      const profile = await authService.getProfile(session.user.id);
      setProfile(profile);
    }
  };

  useEffect(() => {
    let subscription: any;

    const initAuth = async () => {
      const session = await authService.getInitialSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.id) {
        const profile = await authService.getProfile(session.user.id);
        setProfile(profile);
      }

      setLoading(false);

      subscription = authService.subscribeAuthState(async (session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user?.id) {
          const profile = await authService.getProfile(session.user.id);
          setProfile(profile);
        } else {
          setProfile(null);
        }

        setLoading(false);
      });
    };
    initAuth();

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
