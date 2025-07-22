import {
  MediumIcon,
  DiscordIcon,
  TelegramIcon,
  TwitterIcon,
} from '@pufferfinance/puffer-ui-components';

export type FooterSocialLink = {
  name: string;
  icon: React.ReactNode;
  href: string[];
  lang: string[];
};

export const socialLinks: FooterSocialLink[] = [
  {
    name: 'twitter',
    icon: <TwitterIcon />,
    href: [
      'https://twitter.com/Puffer_Finance',
      'https://twitter.com/pufferfi_cn',
    ],
    lang: ['EN', 'CH'],
  },
  {
    name: 'discord',
    icon: <DiscordIcon />,
    href: ['https://discord.com/invite/pufferfi'],
    lang: ['EN'],
  },
  {
    name: 'telegram',
    icon: <TelegramIcon />,
    href: ['https://t.me/puffer_fi', 'https://t.me/puffer_asia'],
    lang: ['EN', 'CH'],
  },
  {
    name: 'medium',
    icon: <MediumIcon />,
    href: ['https://medium.com/@puffer.fi'],
    lang: ['EN'],
  },
];
