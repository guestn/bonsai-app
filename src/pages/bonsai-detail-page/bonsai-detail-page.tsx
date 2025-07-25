import { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BonsaiDetail } from '../../components/domain';
import { useBonsaiById } from '../../hooks/use-bonsai';
import styles from './bonsai-detail-page.module.scss';

export const BonsaiDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { bonsai: tree, isLoading, error, mutate } = useBonsaiById(id || '');

  console.info('BonsaiDetailPage - ID from URL:', id);
  console.info('BonsaiDetailPage - Tree data:', tree);

  const handleBack = () => {
    navigate('/');
  };

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{t('BONSAI.DETAIL.ERROR', { message: error.message })}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <p>{t('BONSAI.DETAIL.LOADING')}</p>
        </div>
      </div>
    );
  }

  if (!tree) {
    return (
      <div className={styles.notFound}>
        <h1>{t('BONSAI.NOT_FOUND.TITLE')}</h1>
        <p>{t('BONSAI.NOT_FOUND.DESCRIPTION')}</p>
        <button onClick={handleBack} className={styles.backButton}>
          {t('BONSAI.NOT_FOUND.BACK_TO_COLLECTION')}
        </button>
      </div>
    );
  }

  return <BonsaiDetail tree={tree} onBack={handleBack} mutate={mutate} />;
};
