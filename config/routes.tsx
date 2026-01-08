import React from 'react';

const Dashboard = React.lazy(() =>
  import("@/views/Dashboard").then((mod) => ({ default: mod.Dashboard }))
);
const EntryForm = React.lazy(() =>
  import("@/views/EntryForm").then((mod) => ({ default: mod.EntryForm }))
);
const EntryDetail = React.lazy(() =>
  import("@/views/EntryDetail").then((mod) => ({ default: mod.EntryDetail }))
);
const Journal = React.lazy(() =>
  import("@/views/Journal").then((mod) => ({ default: mod.Journal }))
);
const BudgetPage = React.lazy(() =>
  import("@/views/Budget").then((mod) => ({ default: mod.BudgetPage }))
);
const Settings = React.lazy(() =>
  import("@/views/Settings").then((mod) => ({ default: mod.Settings }))
);
const Login = React.lazy(() =>
  import("@/views/Login").then((mod) => ({ default: mod.Login }))
);
const Register = React.lazy(() =>
  import("@/views/Register").then((mod) => ({ default: mod.Register }))
);
const Profile = React.lazy(() =>
  import("@/views/Profile").then((mod) => ({ default: mod.Profile }))
);


export interface RouteConfig {
  path: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  isPublic?: boolean;
  preload?: boolean;
}

export const ROUTES: RouteConfig[] = [
  // Public routes
  { 
    path: '/login', 
    component: Login, 
    isPublic: true 
  },
  { 
    path: '/register', 
    component: Register, 
    isPublic: true 
  },
  
  // Protected routes
  { 
    path: '/', 
    component: Dashboard, 
    preload: true // Preload dashboard for faster initial load
  },
  { 
    path: '/new', 
    component: EntryForm 
  },
  { 
    path: '/entry/:id', 
    component: EntryDetail 
  },
  { 
    path: '/journal', 
    component: Journal 
  },
  { 
    path: '/budget', 
    component: BudgetPage 
  },
  { 
    path: '/settings', 
    component: Settings 
  },
  { 
    path: '/profile', 
    component: Profile 
  },
];

export const AUTH_ROUTES = ['/login', '/register'] as const;

export const preloadCriticalRoutes = (): void => {
  ROUTES.filter(route => route.preload).forEach(route => {
    if ('preload' in route.component) {
      (route.component as any).preload?.();
    }
  });
};