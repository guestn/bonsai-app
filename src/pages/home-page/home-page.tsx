import { FC } from 'react';
import styles from './home-page.module.scss';

export const HomePage: FC = () => {
  return (
    <section className={styles.pageContainer}>
      <h1>Bonsai App</h1>
    </section>
  );
};
