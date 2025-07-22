import { FC } from 'react';
import {
  Container,
  Heading,
  Text,
  TextVariant,
} from '@pufferfinance/puffer-ui-components';
import styles from './home-page.module.scss';

export const HomePage: FC = () => {
  return (
    <Container className={styles.pageContainer}>
      <Heading level={1}>Puffer Frontend App Template</Heading>
      <Text variant={TextVariant.Paragraph}>
        Use this template to ship wonderful Puffer apps.
      </Text>
    </Container>
  );
};
