import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../ui/button';
import styles from './google-photos-setup-guide.module.scss';
import { env } from '../../../utils/env';

interface GooglePhotosSetupGuideProps {
  onClose: () => void;
}

export const GooglePhotosSetupGuide: FC<GooglePhotosSetupGuideProps> = ({
  onClose,
}) => {
  const { t } = useTranslation();

  const openGoogleCloudConsole = () => {
    window.open('https://console.cloud.google.com/', '_blank');
  };

  const openGooglePhotosAPI = () => {
    window.open(
      'https://console.cloud.google.com/apis/library/photoslibrary.googleapis.com',
      '_blank',
    );
  };

  return (
    <div className={styles.setupGuide}>
      <div className={styles.setupHeader}>
        <h2>{t('BONSAI.DETAIL.GOOGLE_PHOTOS_SETUP.TITLE')}</h2>
        <p>{t('BONSAI.DETAIL.GOOGLE_PHOTOS_SETUP.DESCRIPTION')}</p>
      </div>

      <div className={styles.setupSteps}>
        <div className={styles.step}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepContent}>
            <h3>{t('BONSAI.DETAIL.GOOGLE_PHOTOS_SETUP.STEP_1_TITLE')}</h3>
            <p>{t('BONSAI.DETAIL.GOOGLE_PHOTOS_SETUP.STEP_1_DESC')}</p>
            <Button
              onPress={openGoogleCloudConsole}
              variant="secondary"
              size="sm"
            >
              {t('BONSAI.DETAIL.GOOGLE_PHOTOS_SETUP.OPEN_CONSOLE')}
            </Button>
          </div>
        </div>

        <div className={styles.step}>
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepContent}>
            <h3>{t('BONSAI.DETAIL.GOOGLE_PHOTOS_SETUP.STEP_2_TITLE')}</h3>
            <p>{t('BONSAI.DETAIL.GOOGLE_PHOTOS_SETUP.STEP_2_DESC')}</p>
            <Button onPress={openGooglePhotosAPI} variant="secondary" size="sm">
              {t('BONSAI.DETAIL.GOOGLE_PHOTOS_SETUP.ENABLE_API')}
            </Button>
          </div>
        </div>

        <div className={styles.step}>
          <div className={styles.stepNumber}>3</div>
          <div className={styles.stepContent}>
            <h3>{t('BONSAI.DETAIL.GOOGLE_PHOTOS_SETUP.STEP_3_TITLE')}</h3>
            <p>{t('BONSAI.DETAIL.GOOGLE_PHOTOS_SETUP.STEP_3_DESC')}</p>
            <div className={styles.codeBlock}>
              <code>VITE_GOOGLE_CLIENT_ID={env.VITE_GOOGLE_CLIENT_ID}</code>
            </div>
          </div>
        </div>

        <div className={styles.step}>
          <div className={styles.stepNumber}>4</div>
          <div className={styles.stepContent}>
            <h3>{t('BONSAI.DETAIL.GOOGLE_PHOTOS_SETUP.STEP_4_TITLE')}</h3>
            <p>{t('BONSAI.DETAIL.GOOGLE_PHOTOS_SETUP.STEP_4_DESC')}</p>
          </div>
        </div>
      </div>

      <div className={styles.setupActions}>
        <Button onPress={onClose} variant="primary">
          {t('BONSAI.DETAIL.GOOGLE_PHOTOS_SETUP.GOT_IT')}
        </Button>
      </div>
    </div>
  );
};
