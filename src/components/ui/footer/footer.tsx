import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './footer.module.scss';

export const Footer: FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <p className={styles.copyright}>
            {t('NAV.COPYRIGHT', { year: currentYear })}
          </p>
        </div>
      </div>
    </footer>
  );
};
