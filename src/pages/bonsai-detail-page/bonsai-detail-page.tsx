import { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BonsaiDetail } from '../../components/domain/bonsai';
import { mockBonsaiData } from '../../data/mock-bonsai-data';
import styles from './bonsai-detail-page.module.scss';

export const BonsaiDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Find the tree by ID
  const tree = mockBonsaiData.find((t) => t.id === id);

  const handleBack = () => {
    navigate('/');
  };

  if (!tree) {
    return (
      <div className={styles.notFound}>
        <h1>Bonsai Tree Not Found</h1>
        <p>The bonsai tree you're looking for doesn't exist.</p>
        <button onClick={handleBack} className={styles.backButton}>
          ← Back to Collection
        </button>
      </div>
    );
  }

  return <BonsaiDetail tree={tree} onBack={handleBack} />;
};
