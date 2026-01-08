import { NotificationPayload, SavingsRateResult } from "@/types/notification.type";
import { calculateSavingsRate, getTodayString, markNotifiedToday, MIN_SAVINGS_RATE } from "@/utils/helpers";
import supabase from "@/utils/supabase";

export class NotificationService {
  private static async getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
    try {
      if (!('serviceWorker' in navigator)) {
        return null;
      }
      // Prefer ready registration but fall back to getRegistration
      try {
        return await navigator.serviceWorker.ready;
      } catch {
        try {
          const reg = await navigator.serviceWorker.getRegistration();
          return reg ?? null;
        } catch (err) {
          console.error('Failed to get service worker registration:', err);
          return null;
        }
      }
    } catch (error) {
      console.error('Service worker not ready:', error);
      return null;
    }
  }

  static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'default') {
      try {
        return await Notification.requestPermission();
      } catch (error) {
        console.error('Failed to request notification permission:', error);
        return 'denied';
      }
    }

    return Notification.permission;
  }


  static async sendNotification(payload: NotificationPayload, userId?: string): Promise<boolean> {
    try {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.info('Notification permission not granted');
        return false;
      }

      const registration = await this.getServiceWorkerRegistration();

      // Try service worker showNotification API first
      if (registration && typeof registration.showNotification === 'function') {
        await registration.showNotification(payload.title, {
          body: payload.body,
          icon: '/icons/ios/192.png',
          tag: 'ledgerone-daily-reminder',
        });
        markNotifiedToday(userId);
        return true;
      }

      // If active worker present, postMessage to it (existing flow)
      if (registration?.active && typeof registration.active.postMessage === 'function') {
        registration.active.postMessage({ type: 'SHOW_NOTIFICATION', payload });
        markNotifiedToday(userId);
        return true;
      }

      // Final fallback: use the Notification constructor directly
      if ('Notification' in window) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const n = new Notification(payload.title, {
          body: payload.body,
          icon: '/icons/ios/192.png',
          tag: 'ledgerone-daily-reminder',
        });
        markNotifiedToday(userId);
        return true;
      }

      console.error('No available mechanism to show notifications');
      return false;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }
}

export class NotificationChecker {
  static async hasTransactionsToday(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', userId)
        .eq('date', getTodayString())
        .limit(1)
        .maybeSingle();

        console.log('Transaction check data:', data, 'error:', error);

      if (error) {
        console.error('Failed to check transactions:', error);
        return true;
      }

      return !!data;
    } catch (error) {
      console.error('Exception checking transactions:', error);
      return true;
    }
  }

  static async getSavingsRate(userId: string): Promise<number | null> {
    try {
      // const { data, error } = await supabase
      //   .rpc('monthly_savings_rate', { uid: userId })
      //   .maybeSingle();


      const { data, error } = await supabase.rpc(
        "rpc_get_financial_summary",
        {
          p_user_id: userId,
          p_period: 'today',
        }
      );

      if (error) {
        console.error('Failed to check savings rate:', error);
        return null;
      }

      const savings_rate = calculateSavingsRate(data.expenses, data.income);

      return savings_rate ?? null;
    } catch (error) {
      console.error('Exception checking savings rate:', error);
      return null;
    }
  }


  static async runChecks(userId: string): Promise<void> {
    try {
      // Check 1: No transactions today
      const hasTransactions = await this.hasTransactionsToday(userId);

      if (!hasTransactions) {
        await NotificationService.sendNotification(
          {
            title: 'LedgerOne Reminder ⏰',
            body: "It's 6 PM — you haven't recorded any transactions today.",
          },
          userId
        );
        // continue to also check savings rate
      }

      // Check 2: check savings rate
      const savingsRate = await this.getSavingsRate(userId);

      if (savingsRate !== null && savingsRate < MIN_SAVINGS_RATE) {
        await NotificationService.sendNotification({
          title: 'Savings Alert ⚠️',
          body: `Your savings rate is ${savingsRate.toFixed(1)}%. Try to save at least ${MIN_SAVINGS_RATE}%.`,
        }, userId);
      }
    } catch (error) {
      console.error('Notification checks failed:', error);
    }
  }
}