export const calculateTrend = (
  current: number,
  prev: number | null
): number | null => {
  if (prev === null || prev === 0) return 0;
  return ((current - prev) / Math.abs(prev)) * 100;
};



export const getGreetingKey = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "dash.morning";
  if (hour < 18) return "dash.afternoon";
  return "dash.evening";
};

export const calculateSavingsRate = (
  expenses: number,
  income: number
): number => {
  if (income <= 0) return 0;
  return ((income - expenses) / income) * 100;
};

export const DAILY_NOTIFICATION_KEY = "ledger_daily_6pm_notified";
export const NOTIFICATION_HOUR = 18; // 6 PM local time
export const MIN_SAVINGS_RATE = 33;

export const getTodayString = (): string => {
  return new Date().toISOString().split("T")[0];
};

export const isNotificationTime = () => {
  if (process.env.NODE_ENV === "development") return true;
  return new Date().getHours() === NOTIFICATION_HOUR;
};

export const getNotificationKey = (userId?: string) =>
  userId ? `${DAILY_NOTIFICATION_KEY}_${userId}` : DAILY_NOTIFICATION_KEY;

export const hasNotifiedToday = (userId?: string): boolean => {
  try {
    const key = getNotificationKey(userId);
    const lastNotified = localStorage.getItem(key);
    return lastNotified === getTodayString();
  } catch {
    return false;
  }
};

export const markNotifiedToday = (userId?: string): void => {
  try {
    const key = getNotificationKey(userId);
    localStorage.setItem(key, getTodayString());
  } catch (error) {
    console.error("Failed to mark notification date:", error);
  }
};

export const canShowNotifications = (userId?: string): boolean => {
  return (
    "Notification" in window &&
    "serviceWorker" in navigator &&
    isNotificationTime() &&
    !hasNotifiedToday(userId)
  );
};
