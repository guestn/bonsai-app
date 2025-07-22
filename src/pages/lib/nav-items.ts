import { TFunction } from 'i18next';
export const navItems = (t: TFunction) => ({
  home: {
    label: t('NAV.HOME'),
    pathname: '/',
    displayWhenConnected: true,
    displayWhenDisconnected: true,
  },
});
