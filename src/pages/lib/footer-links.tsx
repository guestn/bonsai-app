import { FooterLinksGroup } from '@pufferfinance/puffer-ui-components';
import { TFunction } from 'i18next';

export const footerLinks: (t: TFunction) => FooterLinksGroup[] = (t) => [
  {
    links: [
      {
        href: 'https://launchpad.puffer.fi/',
        label: t('NAV.FOOTER.RUN_A_VALIDATOR'),
        isInternal: false,
      },
      {
        href: 'https://docs.puffer.fi/reference/faq/',
        label: t('NAV.FOOTER.FAQ'),
        isInternal: false,
      },
      {
        href: 'https://docs.puffer.fi/',
        label: t('NAV.FOOTER.DOCS'),
        isInternal: false,
      },
      {
        href: 'https://github.com/PufferFinance/PufferPool/tree/master/docs/audits',
        label: t('NAV.FOOTER.AUDITS'),
        isInternal: false,
      },
      {
        href: 'https://www.puffer.fi/unifi',
        label: t('NAV.FOOTER.UNIFI_ROLLUP'),
        isInternal: false,
        badge: t('NAV.BADGES.NEW'),
      },
    ],
  },
];
