import { FC } from 'react';
import {
  Button,
  ButtonVariant,
  LinkButton,
  PageContainer,
  NotFound,
  NotFoundActions,
} from '@pufferfinance/puffer-ui-components';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Head } from '@/components/ui/head/head';
import { navItems } from '../lib/nav-items';
import styles from './not-found-page.module.scss';

export const NotFoundPage: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <PageContainer>
      <Head
        title={t('NOT_FOUND.404')}
        description={t('NOT_FOUND.PAGE_NOT_FOUND')}
      />
      <NotFound
        className={styles.errorContainer}
        title={t('NOT_FOUND.404')}
        description={t('NOT_FOUND.PAGE_NOT_FOUND')}
      >
        <NotFoundActions>
          <Button
            variant={ButtonVariant.Translucent}
            onPress={() => navigate(-1)}
          >
            {t('NOT_FOUND.BACK')}
          </Button>
          <LinkButton
            href={navItems(t).home.pathname}
            variant={ButtonVariant.CTA}
          >
            {t('NOT_FOUND.HOME')}
          </LinkButton>
        </NotFoundActions>
      </NotFound>
    </PageContainer>
  );
};
