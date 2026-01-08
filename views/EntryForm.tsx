import { Button } from "@/components/Layout";
import { AccountSelectionModal } from "@/components/sections/entryForm/AccountSelectionModal";
import { AccountSelector } from "@/components/sections/entryForm/AccountSelector";
import { AmountInput } from "@/components/sections/entryForm/AmountInput";
import { DateAndDescription } from "@/components/sections/entryForm/DateAndDescription";
import { DebtPaymentToggle } from "@/components/sections/entryForm/DebtPaymentToggle";
import { Header } from "@/components/sections/entryForm/Header";
import { ModeSelector } from "@/components/sections/entryForm/ModeSelector";
import { useToast } from "@/components/ui/toast/ToastContext";
import { useAccountTypes } from "@/contexts/AccountTypeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useBookkeeping } from "@/contexts/BookKeepingContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useAccounts } from "@/hooks/useAccounts";
import { accountService } from "@/services/accountService";
import { useTranslation } from "@/store";
import { Currency } from "@/types";
import {
  EntryMode,
  FormState,
  INITIAL_FORM_STATE,
  SelectorType,
} from "@/types/entryForm.type";
import { TransactionDetail } from "@/types/journal.type";
import { convertAmount } from "@/utils";
import {
  createJournalItems,
  formatAmount,
  formatWithDots,
  getAccountTypeForSelector,
} from "@/utils/entryForm";
import supabase from "@/utils/supabase";
import { CheckCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export const EntryForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { AccountTypeMapByName } = useAccountTypes();
  const { entries } = useBookkeeping();
  const { accounts, loading: accountsLoading, refresh } = useAccounts();
  const { currency, language } = useSettings();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const editId = searchParams.get("id");

  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  const [activeSelector, setActiveSelector] = useState<SelectorType>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [icon, setIcon] = useState("💸");
  const [showEmoji, setShowEmoji] = useState(false);

  const emojiInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const accountsMap = useMemo(() => {
    return new Map(accounts.map((acc) => [acc.id, acc]));
  }, [accounts]);

  const filteredAccountsByType = useMemo(() => {
    return {
      expense: accounts.filter(
        (a) => a.account_type_id === AccountTypeMapByName.Expense
      ),
      income: accounts.filter(
        (a) => a.account_type_id === AccountTypeMapByName.Income
      ),
      asset: accounts.filter(
        (a) => a.account_type_id === AccountTypeMapByName.Asset
      ),
      liability: accounts.filter(
        (a) => a.account_type_id === AccountTypeMapByName.Liability
      ),
    };
  }, [accounts, AccountTypeMapByName]);

  const currentFilteredAccounts = useMemo(() => {
    if (!activeSelector) return [];

    const { mode } = formState;

    if (activeSelector === "sub") {
      return filteredAccountsByType.asset.filter(
        (a) => a.id !== formState.mainAccount
      );
    }

    switch (mode) {
      case "expense":
        return filteredAccountsByType.expense;
      case "income":
        return filteredAccountsByType.income;
      case "transfer":
        return filteredAccountsByType.asset;
      default:
        return [];
    }
  }, [activeSelector, formState.mode, filteredAccountsByType]);

  useEffect(() => {
    const loadDetailsTransaction = async () => {
      try {
        if (!editId) return;
        const { data } = await supabase.rpc("rpc_get_journal_detail", {
          p_transaction_id: editId,
        });

        const lines: TransactionDetail[] = data;
        const hasExpense =
          accounts.find((a) => a.id === lines[0]?.account_id)
            ?.account_type_id === AccountTypeMapByName.Expense &&
          accounts.find((a) => a.id === lines[0]?.account_id)
            ?.account_type_id === AccountTypeMapByName.Asset;

        const hasIncome =
          accounts.find((a) => a.id === lines[0]?.account_id)
            ?.account_type_id === AccountTypeMapByName.Asset &&
          accounts.find((a) => a.id === lines[1]?.account_id)
            ?.account_type_id === AccountTypeMapByName.Income;

        const isTransfer =
          accounts.find((a) => a.id === lines[0]?.account_id)
            ?.account_type_id === AccountTypeMapByName.Asset &&
          accounts.find((a) => a.id === lines[1]?.account_id)
            ?.account_type_id === AccountTypeMapByName.Asset;

        let mode: EntryMode = "expense";
        if (hasExpense) {
          mode = "expense";
        } else if (hasIncome) {
          mode = "income";
        } else if (isTransfer) {
          mode = "transfer";
        }
        const total = data.reduce((sum, l) => sum + (l.debit || 0), 0);
        setFormState({
          mode,
          date: lines.map((l) => l.transaction_date)[0].split("T")[0],
          description: lines.map((l) => l.description)[0],
          amount: total.toString(),
          displayAmount: formatAmount(total, true),
          mainAccount: lines[0]?.account_id || "",
          subAccount: lines[1]?.account_id || "",
        });
      } catch (error) {}
    };

    loadDetailsTransaction();
  }, [editId, entries, accountsMap, AccountTypeMapByName, accountsLoading]);

  const handleModeChange = useCallback((newMode: EntryMode) => {
    setFormState((prev) => ({
      ...prev,
      mode: newMode,
      mainAccount: "",
      subAccount: "",
    }));
  }, []);

  const handleAmountChange = useCallback((value: string) => {
    const raw = value.replace(/\D/g, "");
    setFormState((prev) => ({
      ...prev,
      amount: raw,
      displayAmount: formatWithDots(raw),
    }));
  }, []);

  const handleAccountSelect = useCallback(
    (accountId: string) => {
      if (activeSelector === "main") {
        setFormState((prev) => ({ ...prev, mainAccount: accountId }));
      } else {
        setFormState((prev) => ({ ...prev, subAccount: accountId }));
      }
      setActiveSelector(null);
    },
    [activeSelector]
  );

  const handleAddNewAccount = useCallback(async () => {
    if (!newAccountName.trim()) return;

    const isNameTaken = accounts.some(
      (a) => a.name.toLowerCase() === newAccountName.toLowerCase()
    );

    if (isNameTaken) {
      showToast(t("budget.exists_alert"), "warning");
      return;
    }

    const accountType = getAccountTypeForSelector(
      formState.mode,
      activeSelector || "main",
      AccountTypeMapByName
    );

    try {
      await accountService.createAccount({
        account_type_id: accountType,
        name: newAccountName.trim(),
        emoji: icon,
      });

      await refresh();

      setNewAccountName("");
      setIcon("💸");
      setShowAddAccount(false);
    } catch (error) {
      console.error("Failed to create account:", error);
      showToast("Failed to create account", "error");
    }
  }, [
    newAccountName,
    accounts,
    formState.mode,
    activeSelector,
    AccountTypeMapByName,
    icon,
    t,
  ]);

  const handleSave = useCallback(async () => {
    const amt = parseFloat(formState.amount);

    if (
      isNaN(amt) ||
      amt <= 0 ||
      !formState.mainAccount ||
      !formState.subAccount
    ) {
      return;
    }

    setIsSaving(true);
    try {
      let basePayload: any = {
        p_user_id: user?.id,
        p_date: new Date(formState.date).toISOString(),
        p_description: formState.description || t(`mode.${formState.mode}`),
      };
      if (editId) {
        basePayload = {
          ...basePayload,
          p_transaction_id: editId,
          p_new_amount: convertAmount(amt, currency, Currency.IDR),
        };
      } else {
        basePayload = {
          ...basePayload,
          p_amount: convertAmount(amt, currency, Currency.IDR),
        };
      }

      const items = createJournalItems(
        formState.mode,
        amt,
        formState.mainAccount,
        formState.subAccount,
        currency,
        false
      );

      switch (formState.mode) {
        case "expense": {
          if (!editId) {
            const { error } = await supabase.rpc("create_expense", {
              ...basePayload,
              p_expense_account_id: items[0].accountId,
              p_asset_account_id: items[1].accountId,
            });
            if (error) throw error;
          } else {
            const payload = {
              ...basePayload,
              p_new_expense_account_id: items[0].accountId,
              p_new_asset_account_id: items[1].accountId,
            };

            const { error } = await supabase.rpc("update_expense", payload);

            if (!error) {
              showToast("Expense updated", "success");
            }
          }
          break;
        }

        case "income": {
          if (!editId) {
            const { error } = await supabase.rpc("create_income", {
              ...basePayload,
              p_asset_account_id: items[0].accountId,
              p_income_account_id: items[1].accountId,
            });
            if (error) throw error;
          } else {
            await supabase.rpc("update_income", {
              ...basePayload,
              p_new_asset_account_id: items[0].accountId,
              p_new_income_account_id: items[1].accountId,
            });
          }
          break;
        }

        case "transfer": {
          if (!editId) {
            const { error } = await supabase.rpc("create_transfer", {
              ...basePayload,
              p_source_account_id: items[0].accountId,
              p_destination_account_id: items[1].accountId,
            });
            if (error) throw error;
          } else {
            const { error } = await supabase.rpc("update_transfer", {
              ...basePayload,
              p_source_account_id: items[0].accountId,
              p_destination_account_id: items[1].accountId,
            });

            if (!error) {
              showToast("Expense updated", "success");
            }
          }
          break;
        }
      }

      navigate("/journal", {
        replace: true,
      });
    } catch (error) {
      console.error("Save error:", error);
      showToast("Failed to save transaction", "error");
    } finally {
      setIsSaving(false);
    }
  }, [formState, user, currency, navigate, t]);

  const handleDelete = useCallback(async () => {
    if (!editId) return;

    if (window.confirm(t("entry.delete_confirm"))) {
      const { data, error } = await supabase.rpc("delete_transaction", {
        p_transaction_id: editId,
        p_user_id: user?.id,
      });
      if (error) {
        console.error("Delete error:", error);
        showToast("Failed to delete transaction", "error");
        return;
      }

      showToast(t("entry.delete_success"), "success");
      navigate("/journal", {
        replace: true,
      });
    }
  }, [editId, t]);

  const getAccountData = useCallback(
    (accId: string) => {
      const acc = accountsMap.get(accId);
      if (!acc) return { name: t("entry.select_account"), emoji: "🔍" };

      const key = `acc.${acc.name}`;
      const translated = t(key);

      return {
        name: translated !== key ? translated : acc.name,
        emoji: acc.emoji || "💸",
      };
    },
    [accountsMap, t]
  );

  const isValid = useMemo(() => {
    return formState.amount && formState.mainAccount && formState.subAccount;
  }, [formState.amount, formState.mainAccount, formState.subAccount]);

  return (
    <div className="p-6 pt-10 min-h-screen bg-white dark:bg-slate-950 transition-colors">
      <Header
        editId={editId}
        onBack={() => navigate(-1)}
        onDelete={handleDelete}
        t={t}
      />

      <ModeSelector mode={formState.mode} onChange={handleModeChange} t={t} />

      <div className="space-y-6">
        <AmountInput
          currency={currency}
          value={formState.displayAmount}
          onChange={handleAmountChange}
          t={t}
        />

        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl space-y-5 border border-slate-100 dark:border-slate-800 transition-colors shadow-sm">
          {/* {formState.mode === "debt" && (
            <DebtPaymentToggle
              isDebtPayment={formState.isDebtPayment}
              onChange={(value) =>
                setFormState((prev) => ({ ...prev, isDebtPayment: value }))
              }
              t={t}
            />
          )} */}

          <AccountSelector
            type="main"
            mode={formState.mode}
            selectedId={formState.mainAccount}
            onClick={() => {
              setActiveSelector("main");
              setFormState((prev) => ({ ...prev, subAccount: "" }));
            }}
            getAccountData={getAccountData}
            t={t}
          />

          <AccountSelector
            type="sub"
            mode={formState.mode}
            selectedId={formState.subAccount}
            onClick={() => setActiveSelector("sub")}
            getAccountData={getAccountData}
            t={t}
          />

          <DateAndDescription
            date={formState.date}
            description={formState.description}
            onDateChange={(date) => setFormState((prev) => ({ ...prev, date }))}
            onDescriptionChange={(desc) =>
              setFormState((prev) => ({ ...prev, description: desc }))
            }
            t={t}
          />
        </div>

        <Button
          disabled={!isValid || isSaving}
          onClick={handleSave}
          className="w-full py-5 rounded-3xl text-lg shadow-xl shadow-primary-500/20"
        >
          <CheckCircle size={22} />
          {isSaving ? t("common.saving") : t("entry.save")}
        </Button>
      </div>

      {activeSelector && (
        <AccountSelectionModal
          isOpen={!!activeSelector}
          onClose={() => setActiveSelector(null)}
          accounts={currentFilteredAccounts}
          isLoading={accountsLoading}
          onSelect={handleAccountSelect}
          getAccountData={getAccountData}
          showAddAccount={showAddAccount}
          onShowAddAccount={setShowAddAccount}
          newAccountName={newAccountName}
          onNewAccountNameChange={setNewAccountName}
          icon={icon}
          onIconChange={setIcon}
          showEmoji={showEmoji}
          onShowEmojiChange={setShowEmoji}
          onAddAccount={handleAddNewAccount}
          emojiInputRef={emojiInputRef}
          nameInputRef={nameInputRef}
          language={language}
          t={t}
          type={activeSelector}
          mode={formState.mode}
        />
      )}
    </div>
  );
};
