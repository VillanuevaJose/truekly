/* oxlint-disable react/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";

export interface AuthUser {
  id?: string;
  nombre: string;
  primerNombre?: string;
  segundoNombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  username?: string;
  email: string;
  fotoPerfil?: string | null;
  verificado?: boolean;
}

export interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "truekly_auth_profile";

function getInitialUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Inicialización sincrónica desde caché local para evitar parpadeo de botones de visitante
  const [user, setUser] = useState<AuthUser | null>(getInitialUser);

  const fetchUserProfile = async (userId: string, fallbackEmail?: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (!error && data) {
        const profileUser: AuthUser = {
          id: data.id,
          nombre: data.nombre_reniec || `${data.primer_nombre} ${data.apellido_paterno}`.trim(),
          primerNombre: data.primer_nombre,
          segundoNombre: data.segundo_nombre || undefined,
          apellidoPaterno: data.apellido_paterno,
          apellidoMaterno: data.apellido_materno || undefined,
          username: data.username,
          email: data.email || fallbackEmail || "",
          fotoPerfil: data.avatar_url || null,
          verificado: data.identidad_verificada,
        };
        setUser(profileUser);
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profileUser));
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.error("Error al consultar perfil de usuario:", err);
    }
  };

  useEffect(() => {
    // 1. Validar sesión persistida activa en Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        try {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        } catch {
          // ignore
        }
      }
    });

    // 2. Suscribirse a eventos de cambio en la sesión (LOGIN, LOGOUT, TOKEN_REFRESHED)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user.id, session.user.email);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          try {
            localStorage.removeItem(AUTH_STORAGE_KEY);
          } catch {
            // ignore
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = (userData: AuthUser) => {
    setUser(userData);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    } catch {
      // ignore
    }
  };

  const logout = async () => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchUserProfile(session.user.id, session.user.email);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
