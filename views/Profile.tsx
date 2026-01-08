import { useAuth } from "@/contexts/AuthContext";
import authService from "@/services/authService";
import supabase from "@/utils/supabase";
import { set } from "date-fns";
import {
  ChevronDownIcon,
  EditIcon,
  LockIcon,
  MailMinusIcon,
  UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

export const Profile: React.FC = () => {
  const { profile, refreshProfile } = useAuth();

  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);

  const [fullName, setFullName] = useState(profile?.name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");

  const [savingName, setSavingName] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  const [openPassword, setOpenPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changePassword = async () => {
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSavingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setSavingPassword(false);

    if (error) {
      setError(error.message);
      return;
    }

    // Success - logout user
    setPassword("");
    setConfirmPassword("");
    setOpenPassword(false);

    // Logout after password change
    await authService.logout();
  };

  const saveFullName = async () => {
    if (!fullName.trim() || fullName === profile?.name) return;

    setSavingName(true);

    const { error } = await supabase
      .from("profiles")
      .update({ name: fullName })
      .eq("id", profile!.id);

    setSavingName(false);

    if (!error) {
      setEditingName(false);
      // Refresh profile to show updated name
      if (refreshProfile) {
        await refreshProfile();
      }
    }
  };

  const saveEmail = async () => {
    if (!email.trim() || email === profile?.email) return;

    setSavingEmail(true);

    const { error } = await supabase.auth.updateUser({ email });

    setSavingEmail(false);

    if (!error) {
      setEditingEmail(false);

      // Logout after email change
      await authService.logout();
    }
  };

  useEffect(() => {
    if (profile?.name) setFullName(profile.name);
    if (profile?.email) setEmail(profile.email);
  }, [profile]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-safe">
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Profile
        </h1>
      </header>

      <Section title="PROFILE">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <UserIcon />
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Full Name
              </p>

              {editingName ? (
                <input
                  autoFocus
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full bg-transparent border-b
                       border-slate-300 dark:border-slate-700
                       text-slate-900 dark:text-slate-100
                       focus:outline-none"
                />
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {profile?.name || "N/A"}
                </p>
              )}
            </div>

            {editingName ? (
              <button
                onClick={saveFullName}
                disabled={savingName}
                className="text-primary-600 font-medium disabled:opacity-50"
              >
                {savingName ? "Saving..." : "Save"}
              </button>
            ) : (
              <button
                onClick={() => setEditingName(true)}
                className="text-slate-400"
              >
                <EditIcon />
              </button>
            )}
          </div>
        </div>

        <Divider />

        {/* EMAIL */}
        <div className="px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <MailMinusIcon />
          </div>

          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Email Address
            </p>

            {editingEmail ? (
              <>
                <input
                  autoFocus
                  value={email}
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full bg-transparent border-b
                       border-slate-300 dark:border-slate-700
                       text-slate-900 dark:text-slate-100
                       focus:outline-none"
                />
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  You will be logged out after changing email.
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {profile?.email}
              </p>
            )}
          </div>

          {editingEmail ? (
            <button
              onClick={saveEmail}
              disabled={savingEmail}
              className="text-primary-600 font-medium disabled:opacity-50"
            >
              {savingEmail ? "Saving..." : "Save"}
            </button>
          ) : (
            <button
              onClick={() => setEditingEmail(true)}
              className="text-slate-400"
            >
              <EditIcon />
            </button>
          )}
        </div>
      </Section>

      <Section title="SECURITY">
        <div
          onClick={() => setOpenPassword(!openPassword)}
          className="px-4 py-4 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
              <LockIcon />
            </div>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              Change Password
            </span>
          </div>
          <span
            className={`text-slate-400 dark:text-slate-500 transition-transform ${
              openPassword ? "rotate-90" : ""
            }`}
          >
            ›
          </span>
        </div>

        {openPassword && (
          <div className="px-4 pb-4 animate-slide-in">
            <div className="space-y-3">
              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-800
                     border-slate-300 dark:border-slate-700
                     text-slate-900 dark:text-slate-100
                     focus:outline-none focus:ring-2 focus:ring-primary-500"
              />

              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-800
                     border-slate-300 dark:border-slate-700
                     text-slate-900 dark:text-slate-100
                     focus:outline-none focus:ring-2 focus:ring-primary-500"
              />

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}

              <p className="text-xs text-slate-500 dark:text-slate-400">
                You will be logged out after changing password.
              </p>

              <button
                onClick={changePassword}
                disabled={savingPassword}
                className="w-full py-2 rounded-lg bg-primary-600 text-white font-medium
                     hover:bg-primary-700 disabled:opacity-50"
              >
                {savingPassword ? "Saving..." : "Save Password"}
              </button>
            </div>
          </div>
        )}
      </Section>

      <Section>
        <button
          className="w-full px-4 py-4 text-left text-red-600 dark:text-red-400 font-medium"
          onClick={() => authService.logout()}
        >
          Logout
        </button>
      </Section>
    </div>
  );
};

const Section = ({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) => (
  <section className="px-5 mb-6">
    {title && (
      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase mb-2">
        {title}
      </p>
    )}
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden">
      {children}
    </div>
  </section>
);

const SettingRow = ({
  icon,
  label,
  description,
  iconBg = "bg-slate-100 dark:bg-slate-800",
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  iconBg?: string;
}) => (
  <button className="w-full flex items-center gap-4 px-4 py-4 text-left">
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}
    >
      {icon}
    </div>

    <div className="flex-1">
      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
        {label}
      </p>
      {description && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>

    <span className="text-slate-400 dark:text-slate-500">›</span>
  </button>
);

const Divider = () => (
  <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4" />
);
