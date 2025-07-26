import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/auth-provider';
import { LoginButton, UserProfile } from '../auth';
import styles from './header.module.scss';

export const Header: FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, loading } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/" className={styles.logoLink}>
            <h1>{t('HEADER.TITLE')}</h1>
          </Link>
        </div>

        <nav className={styles.navigation}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <Link
                to="/"
                className={`${styles.navLink} ${location.pathname === '/' ? styles.active : ''}`}
              >
                {t('NAV.HOME')}
              </Link>
            </li>
          </ul>
        </nav>

        <div className={styles.auth}>
          {!loading && <>{user ? <UserProfile /> : <LoginButton />}</>}
        </div>
      </div>
    </header>
  );
};
