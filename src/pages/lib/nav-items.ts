import { TFunction } from 'i18next';
import { policyRoutes } from './routes';
export const navItems = (t: TFunction) => ({
  home: {
    label: t('NAV.HOME'),
    pathname: '/',
    displayWhenConnected: true,
    displayWhenDisconnected: true,
  },
  privacyPolicy: {
    label: policyRoutes(t).privacyPolicy.label,
    pathname: policyRoutes(t).privacyPolicy.pathname,
    displayWhenConnected: true,
    displayWhenDisconnected: true,
  },
  termsOfService: {
    label: policyRoutes(t).termsOfService.label,
    pathname: policyRoutes(t).termsOfService.pathname,
    displayWhenConnected: true,
    displayWhenDisconnected: true,
  },
  cookiePolicy: {
    label: policyRoutes(t).cookiePolicy.label,
    pathname: policyRoutes(t).cookiePolicy.pathname,
    displayWhenConnected: true,
    displayWhenDisconnected: true,
  },
});
