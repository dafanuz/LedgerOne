import { memo } from "react";
import { NavLink } from "react-router-dom";
const AVATAR_SEED = "Felix";

export const DashboardHeader = memo<{ greeting: string; subtitle: string }>(
  ({ greeting, subtitle }) => (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          {greeting}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{subtitle}</p>
      </div>
      <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm">
        <NavLink to="/profile" className="block h-full w-full">
          <img
            src="./icons/user.png"
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        </NavLink>
      </div>
    </div>
  )
);
DashboardHeader.displayName = "DashboardHeader";