import { FC } from 'react';
import { Text } from 'react-aria-components';
import styles from './chip.module.scss';

export interface ChipProps {
  label: string;
  variant?: 'active' | 'dormant' | 'flowering' | 'repotted' | 'default';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Chip: FC<ChipProps> = ({
  label,
  variant = 'default',
  size = 'md',
  className,
}) => {
  return (
    <Text
      className={`${styles.chip} ${styles[variant]} ${styles[size]} ${
        className || ''
      }`}
    >
      {label}
    </Text>
  );
};
