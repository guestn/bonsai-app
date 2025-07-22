import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import common from './locales/en/common.json';

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
      common,
    },
  },
  defaultNS: 'common',
});

export default i18n;
