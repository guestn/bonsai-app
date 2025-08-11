import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './compression-stats.module.scss';

interface CompressionStatsProps {
  originalSize: number;
  compressedSize: number;
  sizeReduction: number;
}

export const CompressionStats: FC<CompressionStatsProps> = ({
  originalSize,
  compressedSize,
  sizeReduction,
}) => {
  const { t } = useTranslation();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={styles.compressionStats}>
      <div className={styles.statItem}>
        <span className={styles.label}>
          {t('BONSAI.DETAIL.COMPRESSION.ORIGINAL_SIZE') || 'Original:'}
        </span>
        <span className={styles.value}>{formatFileSize(originalSize)}</span>
      </div>
      <div className={styles.statItem}>
        <span className={styles.label}>
          {t('BONSAI.DETAIL.COMPRESSION.COMPRESSED_SIZE') || 'Compressed:'}
        </span>
        <span className={styles.value}>{formatFileSize(compressedSize)}</span>
      </div>
      <div className={styles.statItem}>
        <span className={styles.label}>
          {t('BONSAI.DETAIL.COMPRESSION.REDUCTION') || 'Reduction:'}
        </span>
        <span className={`${styles.value} ${styles.reduction}`}>
          {sizeReduction.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};
