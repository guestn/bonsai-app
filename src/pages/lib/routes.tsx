import { TFunction } from 'i18next';
import { PrivacyPolicyPage } from '@/pages/privacy-policy-page';
import { TermsOfServicePage } from '@/pages/terms-of-service-page';
import { CookiePolicyPage } from '@/pages/cookie-policy-page';

export const policyRoutes = (t: TFunction) => ({
  privacyPolicy: {
    label: t('NAV.FOOTER.PRIVACY_POLICY'),
    pathname: '/privacy-policy',
    element: <PrivacyPolicyPage />,
  },
  termsOfService: {
    label: t('NAV.FOOTER.TERMS_OF_SERVICE'),
    pathname: '/terms-of-service',
    element: <TermsOfServicePage />,
  },
  cookiePolicy: {
    label: t('NAV.FOOTER.COOKIE_POLICY'),
    pathname: '/cookie-policy',
    element: <CookiePolicyPage />,
  },
});
