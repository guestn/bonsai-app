import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/auth-provider';
import { Button } from '../button';
import styles from './login-button.module.scss';

export const LoginButton: FC = () => {
  const { t } = useTranslation();
  const { signInWithGoogle, signInWithGoogleRedirect } = useAuth();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <Button onPress={handleSignIn} variant="primary">
        {t('AUTH.SIGN_IN_WITH_GOOGLE')}
      </Button>
    </div>
  );
};
