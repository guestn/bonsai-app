import { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BonsaiDetail } from '../../components/domain/bonsai';
import { mockBonsaiData } from '../../data/mock-bonsai-data';
import styles from './bonsai-detail-page.module.scss';

export const BonsaiDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Find the tree by ID
  const tree = mockBonsaiData.find((t) => t.id === id);

  const handleBack = () => {
    navigate('/');
  };

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

  return <BonsaiDetail tree={tree} onBack={handleBack} />;
};
