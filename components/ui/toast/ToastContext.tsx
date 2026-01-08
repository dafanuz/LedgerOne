import { createContext, useContext, useState, ReactNode } from "react";
import { Toast, ToastType, ToastPosition } from "./types";
import ToastItem from "./ToastItem";
import { useSettings } from "@/contexts/SettingsContext";

interface ToastContextValue {
  showToast: (
    message: string,
    type?: ToastType,
    options?: {
      duration?: number;
      closable?: boolean;
    }
  ) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({
  children,
  position = "top",
}: {
  children: ReactNode;
  position?: ToastPosition;
}) {
  const { darkMode } = useSettings();
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = (id: string) =>
    setToasts((t) => t.filter((toast) => toast.id !== id));

  const showToast = (
    message: string,
    type: ToastType = "info",
    options?: { duration?: number; closable?: boolean }
  ) => {
    const id = crypto.randomUUID();

    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        type,
        duration: options?.duration ?? 4000,
        closable: options?.closable ?? true,
      },
    ]);

    setTimeout(() => removeToast(id), options?.duration ?? 4000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className={`fixed z-50 w-full mx-auto p-4 space-y-3 ${getPositionClass(position)}`}>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => removeToast(toast.id)}
            theme={darkMode ? "dark" : "light"}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

const getPositionClass = (position: ToastPosition) => {
  switch (position) {
    case "top":
      return "top-0";
    case "bottom":
      return "bottom-0";
  }
};
