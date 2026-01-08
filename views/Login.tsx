import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../store";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { useToast } from "@/components/ui/toast/ToastContext";
import authService from "@/services/authService";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Validate inputs
      if (!email || !password) {
        setError(t("login.error_empty") || "Please fill in all fields");
        setIsLoading(false);
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError(t("login.error_invalid_email") || "Invalid email format");
        setIsLoading(false);
        return;
      }

      const response = await authService.login(email, password);

      if (response.success) {
        showToast("Login successful!", "success");
        navigate("/");
      } else {
        showToast(response.error || "Login failed", "error");
      }
    } catch (err) {
      setError(t("login.error_failed") || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-full mb-4">
            <LogIn size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {t("login.title") || "Welcome Back"}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {t("login.subtitle") || "Sign in to your account to continue"}
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-lg"
        >
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Email Input */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            >
              {t("login.email") || "Email Address"}
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("login.email_placeholder") || "Enter your email"}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            >
              {t("login.password") || "Password"}
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  t("login.password_placeholder") || "Enter your password"
                }
                className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {t("login.remember_me") || "Remember me"}
              </span>
            </label>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              {t("login.forgot_password") || "Forgot password?"}
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <LogIn size={18} />
            {isLoading
              ? t("login.loading") || "Signing in..."
              : t("login.button") || "Sign In"}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-slate-600 dark:text-slate-400">
            {t("login.no_account") || "Don't have an account?"}{" "}
            <button
              onClick={() => navigate("/register")}
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              {t("login.sign_up") || "Sign up here"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
