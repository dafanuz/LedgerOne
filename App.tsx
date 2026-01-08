import React, { useEffect, useRef, useCallback, Suspense } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  BrowserRouter,
} from "react-router-dom";
import { Layout } from "./components/Layout";
import { RouteLoading } from "./components/ui/loading/RouteLoading";

import { ToastProvider } from "./components/ui/toast/ToastContext";
import { PublicRoute } from "./components/PublicLayout";
import { ProtectedRoute } from "./components/ProtectedLayout";
import { BookkeepingProvider } from "./contexts/BookKeepingContext";
import { SettingsProvider, useSettings } from "./contexts/SettingsContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AccountTypeProvider } from "./contexts/AccountTypeContext";
import {
  canShowNotifications,
} from "./utils/helpers";
import { AUTH_ROUTES, preloadCriticalRoutes, ROUTES } from "./config/routes";
import { NotificationChecker } from "./services/notificationService";

export const NotificationHandler = () => {
  const { user } = useAuth();
  const { notifications } = useSettings();
  const hasRunRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const runNotificationCheck = useCallback(async () => {
    // Guard clauses
    if (!user?.id || !notifications || !canShowNotifications(user.id)) {
      return;
    }

    // Prevent multiple simultaneous runs
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    try {
      await NotificationChecker.runChecks(user.id);
    } catch (error) {
      console.error("Notification check failed:", error);
    } finally {
      hasRunRef.current = false;
    }
  }, [user?.id, notifications]);

  useEffect(() => {
    // Run immediately once, then poll every minute while user is active.
    runNotificationCheck();

    const interval = setInterval(() => {
      runNotificationCheck();
    }, 60 * 1000);

    return () => {
      clearInterval(interval);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      hasRunRef.current = false;
    };
  }, [runNotificationCheck]);

  return null;
};

const LazyRoute: React.FC<{
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  isPublic?: boolean;
}> = ({ component: Component, isPublic = false }) => {
  const Wrapper = isPublic ? PublicRoute : React.Fragment;

  return (
    <Suspense fallback={<RouteLoading />}>
      <Wrapper>
        <Component />
      </Wrapper>
    </Suspense>
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAuthPage = AUTH_ROUTES.includes(location.pathname as typeof AUTH_ROUTES[number]);

  useEffect(() => {
    if (!isAuthPage) {
      preloadCriticalRoutes();
    }
  }, [isAuthPage]);
  
  if (isAuthPage) {
    return (
      <Routes>
        {ROUTES.filter(r => r.isPublic).map(({ path, component }) => (
          <Route
            key={path}
            path={path}
            element={<LazyRoute component={component} isPublic />}
          />
        ))}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }
  return (
    <ProtectedRoute>
        <Routes>
          {ROUTES.filter(r => !r.isPublic).map(({ path, component }) => (
            <Route
              key={path}
              path={path}
              element={<LazyRoute component={component} />}
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </ProtectedRoute>
  );
}

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <AccountTypeProvider>
        <SettingsProvider>
          <BookkeepingProvider>
            {children}
          </BookkeepingProvider>
        </SettingsProvider>
      </AccountTypeProvider>
    </AuthProvider>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <NotificationHandler />
      <ToastProvider position="top">
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ToastProvider>
    </AppProvider>
  );
};

export default App;
