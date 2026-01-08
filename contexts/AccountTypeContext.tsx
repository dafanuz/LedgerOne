import { AccountTypeService } from "@/services/accountService";
import { AccountType } from "@/types/account.type";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface AccountTypeContextValue {
  accountTypes: AccountType[];
  loading: boolean;

  getById: (id: number) => AccountType | undefined;
  getByName: (name: string) => AccountType | undefined;

  AccountTypeMapByName: Record<AccountType["name"], number>;
  AccountTypeMapById: Record<AccountType["id"], AccountType["name"]>;
}

const AccountTypeContext = createContext<AccountTypeContextValue | undefined>(
  undefined
);

export const AccountTypeProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AccountTypeService.getAll()
      .then(setAccountTypes)
      .finally(() => setLoading(false));
  }, []);

  const AccountTypeMapByName = useMemo(() => {
    return accountTypes.reduce((acc, t) => {
      acc[t.name] = t.id;
      return acc;
    }, {} as Record<AccountType["name"], number>);
  }, [accountTypes]);

  const AccountTypeMapById = useMemo(() => {
    return accountTypes.reduce((acc, t) => {
      acc[t.id] = t.name;
      return acc;
    }, {} as Record<AccountType["id"], AccountType["name"]>);
  }, [accountTypes]);

  const value = useMemo<AccountTypeContextValue>(() => {
    return {
      accountTypes,
      loading,

      getById: (id: number) => accountTypes.find((t) => t.id === id),

      getByName: (name: string) =>
        accountTypes.find((t) => t.name.toLowerCase() === name.toLowerCase()),

      AccountTypeMapByName,
      AccountTypeMapById,
    };
  }, [accountTypes, loading, AccountTypeMapByName, AccountTypeMapById]);

  return (
    <AccountTypeContext.Provider value={value}>
      {children}
    </AccountTypeContext.Provider>
  );
};

export const useAccountTypes = () => {
  const context = useContext(AccountTypeContext);
  if (!context) {
    throw new Error("useAccountTypes must be used within AccountTypeProvider");
  }
  return context;
};
