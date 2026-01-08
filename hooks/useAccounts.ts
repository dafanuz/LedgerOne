import { useAuth } from "@/contexts/AuthContext";
import { accountService } from "@/services/accountService";
import { Account } from "@/types/account.type";
import { useCallback, useEffect, useState } from "react";

export const useAccounts = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAccounts = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await accountService.getAccounts(user.id);
      setAccounts(data);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return {
    accounts,
    loading,
    refresh: fetchAccounts,
  };
};
