import { FC } from 'react';
import { BonsaiList } from '../../components/domain';
import styles from './bonsai-page.module.scss';

export const BonsaiPage: FC = () => {
  return (
    <section className={styles.pageContainer}>
      <BonsaiList />
    </section>
  );
};
