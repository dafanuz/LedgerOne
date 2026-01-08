import { INITIAL_ACCOUNTS, INITIAL_STATE } from "@/constants";
import { Account, AppState, Budget, JournalEntry } from "@/types";
import { createContext, useContext, useMemo, useState } from "react";

interface BookkeepingContextType extends AppState {
  addEntry: (entry: Omit<JournalEntry, "id" | "createdAt">) => void;
  updateEntry: (entry: JournalEntry) => void;
  deleteEntry: (id: string) => void;
  addAccount: (account: Omit<Account, "id">) => void; // Fungsi baru
  addBudget: (budget: Budget) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
  importData: (jsonData: string) => boolean;
}

const BookkeepingContext = createContext<BookkeepingContextType | undefined>(
  undefined
);

export const BookkeepingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem("ledger_app_state");
    if (saved) {
      try {
        const parsedState = JSON.parse(saved);
        const existingIds = new Set(
          parsedState.accounts.map((a: Account) => a.id)
        );
        const missingAccounts = INITIAL_ACCOUNTS.filter(
          (a) => !existingIds.has(a.id)
        );

        if (missingAccounts.length > 0) {
          return {
            ...parsedState,
            accounts: [...parsedState.accounts, ...missingAccounts],
          };
        }
        return parsedState;
      } catch (e) {
        console.error("Failed to parse state", e);
        return INITIAL_STATE;
      }
    }
    return INITIAL_STATE;
  });

  const addEntry = (entryData: Omit<JournalEntry, "id" | "createdAt">) => {
    const newEntry: JournalEntry = {
      ...entryData,
      id: `entry_${Date.now()}`,
      createdAt: Date.now(),
    };
    setState((prev) => ({ ...prev, entries: [newEntry, ...prev.entries] }));
  };

  const updateEntry = (updatedEntry: JournalEntry) => {
    setState((prev) => ({
      ...prev,
      entries: prev.entries.map((e) =>
        e.id === updatedEntry.id ? updatedEntry : e
      ),
    }));
  };

  const deleteEntry = (id: string) => {
    setState((prev) => ({
      ...prev,
      entries: prev.entries.filter((e) => e.id !== id),
    }));
  };

  const addAccount = (accountData: Omit<Account, "id">) => {
    const newAccount: Account = {
      ...accountData,
      id: `acc_custom_${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      accounts: [...prev.accounts, newAccount],
    }));
  };

  const addBudget = (budget: Budget) => {
    setState((prev) => ({
      ...prev,
      budgets: [...prev.budgets, { ...budget, id: `bud_${Date.now()}` }],
    }));
  };

  const updateBudget = (updatedBudget: Budget) => {
    setState((prev) => ({
      ...prev,
      budgets: prev.budgets.map((b) =>
        b.id === updatedBudget.id ? updatedBudget : b
      ),
    }));
  };

  const deleteBudget = (id: string) => {
    setState((prev) => ({
      ...prev,
      budgets: prev.budgets.filter((b) => b.id !== id),
    }));
  };

  const importData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed.entries || !parsed.accounts || !parsed.settings) return false;
      setState(parsed);
      return true;
    } catch (e) {
      return false;
    }
  };

  const value = useMemo(
    () => ({
      ...state,
      addEntry,
      updateEntry,
      deleteEntry,
      addAccount,
      addBudget,
      updateBudget,
      deleteBudget,
      importData,
    }),
    [state]
  );

  return (
    <BookkeepingContext.Provider value={value}>
      {children}
    </BookkeepingContext.Provider>
  );
};

export const useBookkeeping = () => {
  const context = useContext(BookkeepingContext);
  if (!context) throw new Error("useBookkeeping must be used within provider");
  return context;
};
