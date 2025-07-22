import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import commonEn from './locales/en/common.json';
import commonEs from './locales/es/common.json';

i18n.use(initReactI18next).init({
  debug: true,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  react: {
    transKeepBasicHtmlNodesFor: ['ul', 'li', 'b', 'strong'],
  },
  resources: {
    en: {
      common: commonEn,
    },
    es: {
      common: commonEs,
    },
  },
  defaultNS: 'common',
});

export default i18n;
