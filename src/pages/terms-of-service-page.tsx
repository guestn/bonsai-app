import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { marked } from 'marked';
import { Skeleton } from '@pufferfinance/puffer-ui-components';
import { Head } from '@/components/ui/head/head';
import { useAsync } from '@/hooks/use-async';
import styles from '@/styles/markdown.module.scss';

const TERMS_OF_SERVICE_DOC =
  'https://raw.githubusercontent.com/PufferFinance/website-docs/refs/heads/main/docs/terms-of-service.md';

export const TermsOfServicePage: FC = () => {
  const { t } = useTranslation();

  const { data, isLoading } = useAsync(async () => {
    const res = await fetch(TERMS_OF_SERVICE_DOC);
    const markdown = (await res.text())
      .replace('https://docs.puffer.fi/cookie-policy', '/cookie-policy')
      .replace('https://docs.puffer.fi/terms-of-service', '/terms-of-service')
      .replace('https://docs.puffer.fi/privacy-policy', '/privacy-policy');

    return await marked(markdown);
  }, []);

  return (
    <>
      <Head title={t('NAV.FOOTER.TERMS_OF_SERVICE')} />
      <div className={styles.markdown}>
        {isLoading && <Skeleton count={20} />}
        {data && !isLoading && (
          <div dangerouslySetInnerHTML={{ __html: data }} />
        )}
      </div>
    </>
  );
};
