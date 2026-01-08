import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import supabase from "@/utils/supabase";
import { Currency, Language } from "@/types";
import { NotificationService } from "@/services/notificationService";

export interface SettingsState {
  darkMode: boolean;
  notifications: boolean;
  currency: Currency;
  language: Language;
}

interface SettingsContextValue extends SettingsState {
  toggleDarkMode: () => void;
  toggleNotifications: () => void;
  setCurrency: (currency: Currency) => void;
  setLanguage: (language: Language) => void;
}

const DEFAULT_SETTINGS: SettingsState = {
  darkMode: false,
  notifications: true,
  currency: Currency.IDR,
  language: "id",
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const SettingsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SettingsState>(() => {
    const cached = localStorage.getItem("ledger_settings");
    return cached ? JSON.parse(cached) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    if (!user?.id) return;

    const hydrate = async () => {
      const { data, error } = await supabase
        .from("user_settings")
        .select("dark_mode, notifications_enabled, base_currency, language")
        .eq("user_id", user.id)
        .single();

      if (error || !data) return;

      setSettings((prev) => ({
        ...prev,
        darkMode: data.dark_mode,
        notifications: data.notifications_enabled,
        currency: data.base_currency,
        language: data.language,
      }));
    };

    hydrate();
  }, [user?.id]);

  useEffect(() => {
    localStorage.setItem("ledger_settings", JSON.stringify(settings));

    document.documentElement.classList.toggle("dark", settings.darkMode);
  }, [settings]);

  const toggleDarkMode = async () => {
    const next = !settings.darkMode;

    setSettings((prev) => ({ ...prev, darkMode: next }));

    if (user?.id) {
      try {
        const { error } = await supabase
          .from("user_settings")
          .update({ dark_mode: next })
          .eq("user_id", user.id);

        if (error) {
          setSettings((prev) => ({ ...prev, darkMode: !next }));
          console.error("Failed to update dark mode:", error);
        }
      } catch (err) {
        setSettings((prev) => ({ ...prev, darkMode: !next }));
        console.error("Network error:", err);
      }
    }
  };

  const toggleNotifications = useCallback(async () => {
    const next = !settings.notifications;

    if (next) {
      const permission = await NotificationService.requestPermission();
      if (permission === "denied") return;
    }

    setSettings((prev) => ({ ...prev, notifications: next }));

    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from("user_settings")
        .update({ notifications_enabled: next })
        .eq("user_id", user.id);

      if (error) throw error;
    } catch {
      setSettings((prev) => ({ ...prev, notifications: !next }));
    }
  }, [settings.notifications, user?.id]);

  const setCurrency = async (currency: Currency) => {
    setSettings((prev) => ({ ...prev, currency }));

    if (user?.id) {
      try {
        const { error } = await supabase
          .from("user_settings")
          .update({ base_currency: currency })
          .eq("user_id", user.id);

        if (error) {
          setSettings((prev) => ({ ...prev, base_currency: prev.currency }));
          console.error("Failed to update notifications:", error);
        }
      } catch (err) {
        setSettings((prev) => ({ ...prev, base_currency: prev.currency }));
        console.error("Network error:", err);
      }
    }
  };

  const setLanguage = async (language: Language) => {
    setSettings((prev) => ({ ...prev, language: language }));

    if (user?.id) {
      try {
        const { error } = await supabase
          .from("user_settings")
          .update({ language: language })
          .eq("user_id", user.id);

        if (error) {
          setSettings((prev) => ({ ...prev, language: prev.language }));
          console.error("Failed to update notifications:", error);
        }
      } catch (err) {
        setSettings((prev) => ({ ...prev, language: prev.language }));
        console.error("Network error:", err);
      }
    }

    setSettings((prev) => {
      if (user?.id) {
        supabase
          .from("user_settings")
          .update({ language })
          .eq("user_id", user.id);
      }

      return { ...prev, language };
    });
  };

  const value = useMemo(
    () => ({
      ...settings,
      toggleDarkMode,
      toggleNotifications,
      setCurrency,
      setLanguage,
    }),
    [settings]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
};
