import { FC, ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

type HeadProps = {
  title: string;
  description?: string;
  ogImage?: string;
  children?: ReactNode;
};

export const Head: FC<HeadProps> = ({
  title,
  description,
  ogImage = '/images/common/og-image.png',
  children,
}) => {
  const { t } = useTranslation();

  const titleWithHeader = `${title} | ${t('HEADER.TITLE')}`;

  return (
    <Helmet>
      <title>{titleWithHeader}</title>
      <meta name="description" content={description} />

      <meta property="og:title" content={titleWithHeader} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter/X */}
      <meta name="twitter:card" content={ogImage} />
      <meta name="twitter:title" content={titleWithHeader} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {children}
    </Helmet>
  );
};
