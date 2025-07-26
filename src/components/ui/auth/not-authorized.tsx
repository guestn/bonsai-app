import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Heading, Text } from 'react-aria-components';
import { Button } from '../button';
import { useAuth } from '../../../context/auth-provider';
import styles from './not-authorized.module.scss';

export const NotAuthorized: FC = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Heading level={1} className={styles.title}>
          {t('AUTH.NOT_AUTHORIZED.TITLE')}
        </Heading>
        <Text className={styles.message}>
          {t('AUTH.NOT_AUTHORIZED.MESSAGE')}
        </Text>
        <div className={styles.actions}>
          <Button onPress={logout} variant="primary">
            {t('AUTH.SIGN_OUT')}
          </Button>
        </div>
      </div>
    </div>
  );
};
