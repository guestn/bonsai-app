import { FC } from 'react';
import { BonsaiPage } from '../bonsai-page/bonsai-page';
import styles from './home-page.module.scss';

export const HomePage: FC = () => {
  return (
    <section className={styles.pageContainer}>
      <BonsaiPage />
    </section>
  );
};
