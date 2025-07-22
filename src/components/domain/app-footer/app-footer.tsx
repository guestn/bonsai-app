import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { Footer, FooterVariant } from '@pufferfinance/puffer-ui-components';
import { navItems } from '@/pages/lib/nav-items';
import { socialLinks } from '@/pages/lib/social-links';
import { footerLinks } from '@/pages/lib/footer-links';
import { policyRoutes } from '@/pages/lib/routes';
import styles from './app-footer.module.scss';

export const AppFooter = () => {
  const { t } = useTranslation();

  return (
    <Footer
      background={false}
      variant={FooterVariant.Compact}
      logo={
        <NavLink to={navItems(t).home.pathname}>
          <img
            src="/images/logos/puffer-logo-white.svg"
            alt={t('HEADER.TITLE')}
          />
        </NavLink>
      }
      className={styles.footer}
      links={footerLinks(t)}
      socialLinks={socialLinks}
      copyright={t('NAV.COPYRIGHT', { year: new Date().getFullYear() })}
      copyrightLinks={[
        {
          label: policyRoutes(t).privacyPolicy.label,
          href: policyRoutes(t).privacyPolicy.pathname,
        },
        {
          label: policyRoutes(t).termsOfService.label,
          href: policyRoutes(t).termsOfService.pathname,
        },
        {
          label: policyRoutes(t).cookiePolicy.label,
          href: policyRoutes(t).cookiePolicy.pathname,
        },
      ]}
    />
  );
};
