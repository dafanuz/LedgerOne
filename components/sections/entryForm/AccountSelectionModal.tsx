// components/AccountSelectionModal.tsx

import { Badge } from "@/components/Layout";
import { IconRenderer } from "@/components/ui/icon/icon";
import { CATEGORY_ICONS } from "@/constants";
import { useAccountTypes } from "@/contexts/AccountTypeContext";
import useMobile from "@/hooks/useMobile";
import { EntryMode } from "@/types/entryForm.type";
import { getLabelConfig } from "@/utils/entryForm";
import { X, Plus } from "lucide-react";
import { useMemo } from "react";

interface AccountSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: any[];
  isLoading: boolean;
  onSelect: (accountId: string) => void;
  getAccountData: (id: string) => { name: string; emoji: string };
  showAddAccount: boolean;
  onShowAddAccount: (show: boolean) => void;
  newAccountName: string;
  onNewAccountNameChange: (name: string) => void;
  icon: string;
  onIconChange: (icon: string) => void;
  showEmoji: boolean;
  onShowEmojiChange: (show: boolean) => void;
  onAddAccount: () => void;
  emojiInputRef: React.RefObject<HTMLInputElement>;
  nameInputRef: React.RefObject<HTMLInputElement>;
  language: string;
  t: (key: string) => string;
  type: "main" | "sub";
  mode: EntryMode;
}

export const AccountSelectionModal: React.FC<AccountSelectionModalProps> = ({
  isOpen,
  onClose,
  accounts,
  isLoading,
  onSelect,
  getAccountData,
  showAddAccount,
  onShowAddAccount,
  newAccountName,
  onNewAccountNameChange,
  icon,
  onIconChange,
  showEmoji,
  onShowEmojiChange,
  onAddAccount,
  emojiInputRef,
  nameInputRef,
  language,
  t,
  type,
  mode,
}) => {
  const { AccountTypeMapById } = useAccountTypes();
  if (!isOpen) return null;

  // OR keep the individual functions but simplify them:
  const getLabel = () => {
    const config = getLabelConfig(type, mode, t);
    return config.select;
  };

  const getLoadingLabel = () => {
    const config = getLabelConfig(type, mode, t);
    return config.loading;
  };

  const getNotFoundLabel = () => {
    const config = getLabelConfig(type, mode, t);
    return config.notFound;
  };

  const getAddLabel = () => {
    const config = getLabelConfig(type, mode, t);
    return config.add;
  };

  const isAssetType = useMemo(
    () =>
      ((type === "sub" && (mode === "expense" || mode === "income")) || mode === 'transfer'),
    [type, mode]
  );

  const handleEmojiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      // Extract emoji using Unicode regex
      const emojiMatch = value.match(
        /[\p{Emoji_Presentation}\p{Emoji}\uFE0F]/gu
      );
      if (emojiMatch && emojiMatch.length > 0) {
        const emoji = emojiMatch[emojiMatch.length - 1];
        onIconChange(emoji);
      } else {
        onIconChange(value);
      }
      // Clear input after selection
      e.target.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-10 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-t-[2.5rem] w-full max-w-md h-[75vh] flex flex-col shadow-2xl border-t border-slate-200 dark:border-slate-800 relative">
        {/* Loading Overlay with Blur */}
        {isLoading && (
          <div className="absolute inset-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-t-[2.5rem] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-primary-200 dark:border-primary-900 rounded-full"></div>
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                {getLoadingLabel() || "Loading..."}
              </p>
            </div>
          </div>
        )}

        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-xl">{getLabel()}</h3>
          <button
            onClick={onClose}
            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {!isLoading && accounts.length === 0 ? (
            <p className="text-center text-slate-500 mt-10">
              {getNotFoundLabel() || "Not found."}
            </p>
          ) : null}

          {!isLoading &&
            accounts.map((acc) => {
              const info = getAccountData(acc.id);
              return (
                <button
                  key={acc.id}
                  onClick={() => onSelect(acc.id)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <IconRenderer name={acc.emoji} className="text-lg" />
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {info.name}
                    </span>
                  </div>
                  <Badge color="blue">
                    {t(`type.${AccountTypeMapById[acc.account_type_id]}`)}
                  </Badge>
                </button>
              );
            })}

          {/* button add akun */}
          {!isLoading && !showAddAccount && !isAssetType ? (
            <button
              onClick={() => onShowAddAccount(true)}
              className="w-full flex items-center justify-center gap-2 p-4 mt-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-primary-500 font-bold hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"
            >
              <Plus size={18} />
              {getAddLabel()}
            </button>
          ) : !isLoading && showAddAccount ? (
            <AddAccountForm
              newAccountName={newAccountName}
              onNewAccountNameChange={onNewAccountNameChange}
              icon={icon}
              onIconChange={onIconChange}
              showEmoji={showEmoji}
              onShowEmojiChange={onShowEmojiChange}
              onAddAccount={onAddAccount}
              onCancel={() => onShowAddAccount(false)}
              emojiInputRef={emojiInputRef}
              nameInputRef={nameInputRef}
              handleEmojiChange={handleEmojiChange}
              language={language}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

interface AddAccountFormProps {
  newAccountName: string;
  onNewAccountNameChange: (name: string) => void;
  icon: string;
  onIconChange: (icon: string) => void;
  showEmoji: boolean;
  onShowEmojiChange: (show: boolean) => void;
  onAddAccount: () => void;
  onCancel: () => void;
  emojiInputRef: React.RefObject<HTMLInputElement>;
  nameInputRef: React.RefObject<HTMLInputElement>;
  handleEmojiChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  language: string;
}

const AddAccountForm: React.FC<AddAccountFormProps> = ({
  newAccountName,
  onNewAccountNameChange,
  icon,
  onIconChange,
  showEmoji,
  onShowEmojiChange,
  onAddAccount,
  onCancel,
  emojiInputRef,
  nameInputRef,
  handleEmojiChange,
  language,
}) => {
  const isMobile = useMobile();

  const handleIconClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isMobile) {
      // On mobile, open native emoji keyboard
      if (emojiInputRef.current) {
        emojiInputRef.current.focus();
        // Trigger click to ensure keyboard opens on Chrome mobile
        emojiInputRef.current.click();
      }
    } else {
      // On desktop, toggle emoji picker
      onShowEmojiChange(!showEmoji);
    }
  };

  const handleEmojiBlur = () => {
    // Clear input when keyboard closes
    if (emojiInputRef.current) {
      emojiInputRef.current.value = "";
    }
  };

  return (
    <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-3xl mt-4 border border-slate-200 dark:border-slate-800 shadow-inner flex flex-col items-center gap-6">
      {showEmoji && !isMobile && (
        <div className="icon-picker p-4 flex flex-wrap gap-3 justify-center max-h-48 overflow-y-auto">
          {CATEGORY_ICONS.map((iconName) => (
            <button
              type="button"
              key={iconName}
              className={`icon-btn p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors ${
                icon === iconName
                  ? "border-2 border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                  : ""
              }`}
              onClick={() => onIconChange(iconName)}
            >
              {/* <IconRenderer name={iconName} size={24} /> */}
              <IconRenderer name={iconName} className="text-lg" />
            </button>
          ))}
        </div>
      )}

      <div className="relative group" onClick={handleIconClick}>
        <input
          ref={emojiInputRef}
          type="text"
          inputMode="text"
          autoComplete="off"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleEmojiChange}
          onBlur={handleEmojiBlur}
          value=""
          style={{ fontSize: "16px" }}
          aria-label="Select emoji"
        />
        <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center text-5xl shadow-lg border border-slate-200 dark:border-slate-700 active:scale-95 transition-all cursor-pointer">
          <IconRenderer name={icon} className="text-lg text-amber-500" />
        </div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary-600 text-white p-1.5 rounded-full shadow-lg border-2 border-white dark:border-slate-900 group-hover:scale-110 transition-transform">
          <Plus size={12} />
        </div>
      </div>

      <div className="w-full space-y-4">
        <input
          ref={nameInputRef}
          type="text"
          placeholder={
            language === "id" ? "Nama kategori..." : "Category name..."
          }
          value={newAccountName}
          onChange={(e) => onNewAccountNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAddAccount();
            }
          }}
          className="w-full p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 font-bold text-center"
        />

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-4 text-xs font-bold bg-slate-200 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            {language === "id" ? "Batal" : "Cancel"}
          </button>
          <button
            onClick={onAddAccount}
            disabled={!newAccountName.trim()}
            className="flex-1 py-4 text-xs font-bold bg-primary-600 text-white rounded-2xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {language === "id" ? "Simpan" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};
