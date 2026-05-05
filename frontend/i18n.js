import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import en from "./locales/en.json";
import am from "./locales/am.json";

const resources = {
  en: { translation: en },
  am: { translation: am },
};

// Detect the device language tag (e.g. "am-ET", "en-US")
const deviceLocale = Localization.getLocales?.()?.[0]?.languageTag || "en";
const deviceLang = deviceLocale.startsWith("am") ? "am" : "en";

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: deviceLang,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: "v3",
  });

export default i18n;
