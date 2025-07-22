import { FC } from 'react';
import { BonsaiList } from '../../components/domain/bonsai';
import styles from './home-page.module.scss';

export const HomePage: FC = () => {
  return (
    <section className={styles.pageContainer}>
      <BonsaiList />
    </section>
  );
};
