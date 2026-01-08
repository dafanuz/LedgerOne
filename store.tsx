import {
  TRANSLATIONS,
} from "./constants";
import { useSettings } from "./contexts/SettingsContext";

export const useTranslation = () => {
  const { language } = useSettings();
  const t = (key: string) => {
    const lang = language || "en";
    const dict = TRANSLATIONS[lang] as Record<string, string>;
    return dict[key] || key;
  };
  return { t, language: language };
};
