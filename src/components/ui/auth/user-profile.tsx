import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/auth-provider';
import styles from './user-profile.module.scss';

export const UserProfile: FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) return null;

  return (
    <div className={styles.userProfile}>
      <div className={styles.userInfo}>
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className={styles.avatar}
          />
        )}
        <span className={styles.userName}>
          {user.displayName || user.email}
        </span>
      </div>
      <button onClick={handleLogout} className={styles.logoutButton}>
        {t('AUTH.SIGN_OUT')}
      </button>
    </div>
  );
};
