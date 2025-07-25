import { FC, ReactNode } from 'react';
import {
  Button as AriaButton,
  ButtonProps as AriaButtonProps,
} from 'react-aria-components';
import styles from './button.module.scss';

interface ButtonProps extends Omit<AriaButtonProps, 'className'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Button: FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  onPress,
  isDisabled,
  type,
  style,
  'aria-label': ariaLabel,
  ...restProps
}) => {
  const buttonClassName = `${styles.button} ${styles[variant]} ${styles[size]} ${className || ''}`;

  return (
    <AriaButton
      className={buttonClassName}
      onPress={onPress}
      isDisabled={isDisabled}
      type={type}
      style={style}
      aria-label={ariaLabel}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...restProps}
    >
      {children}
    </AriaButton>
  );
};
