import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../store";
import { Mail, Lock, Eye, EyeOff, User, UserPlus } from "lucide-react";
import authService from "@/services/authService";
import { useToast } from "@/components/ui/toast/ToastContext";

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setAgreedToTerms(false);
  };

  const validateForm = (): boolean => {
    if (!name || !email || !password || !confirmPassword) {
      setError(t("register.error_empty") || "Please fill in all fields");
      return false;
    }

    if (name.trim().length < 2) {
      setError(
        t("register.error_name_short") || "Name must be at least 2 characters"
      );
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t("register.error_invalid_email") || "Invalid email format");
      return false;
    }

    if (password.length < 6) {
      setError(
        t("register.error_password_short") ||
          "Password must be at least 6 characters"
      );
      return false;
    }

    if (password !== confirmPassword) {
      setError(
        t("register.error_password_mismatch") || "Passwords do not match"
      );
      return false;
    }

    if (!agreedToTerms) {
      setError(
        t("register.error_terms") || "Please agree to the terms and conditions"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        confirmPassword,
      };

      const response = await authService.register(payload);
      if (response.success) {
        showToast(response.error, "success");
      } else {
        showToast(response.error || "Registration failed", "error");
      }
    } catch (err) {
      setError(
        t("register.error_failed") || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
      resetForm();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-600 rounded-full mb-4">
            <UserPlus size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {t("register.title") || "Create Account"}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {t("register.subtitle") ||
              "Join us to start managing your finances"}
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

          {/* Full Name Input */}
          <div className="mb-4">
            <label
              htmlFor="fullName"
              className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            >
              {t("register.full_name") || "Full Name"}
            </label>
            <div className="relative">
              <User
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />
              <input
                id="fullName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  t("register.name_placeholder") || "Enter your full name"
                }
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            >
              {t("register.email") || "Email Address"}
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
                placeholder={
                  t("register.email_placeholder") || "Enter your email"
                }
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            >
              {t("register.password") || "Password"}
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
                  t("register.password_placeholder") || "Create a password"
                }
                className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t("register.password_hint") || "At least 6 characters"}
            </p>
          </div>

          {/* Confirm Password Input */}
          <div className="mb-4">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            >
              {t("register.confirm_password") || "Confirm Password"}
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={
                  t("register.confirm_password_placeholder") ||
                  "Confirm your password"
                }
                className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="mb-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mt-1"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {t("register.agree_terms") ||
                  "I agree to the Terms of Service and Privacy Policy"}
              </span>
            </label>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus size={18} />
            {isLoading
              ? t("register.loading") || "Creating account..."
              : t("register.button") || "Create Account"}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="text-center mt-6">
          <p className="text-slate-600 dark:text-slate-400">
            {t("register.already_account") || "Already have an account?"}
            <button
              onClick={() => navigate("/login")}
              className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              {t("register.sign_in") || "Sign in here"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
