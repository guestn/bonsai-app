import { FC, ReactElement, ReactNode } from 'react';
import {
  Label,
  Popover,
  Select as PrimitiveSelect,
  SelectValue,
  SelectProps as PrimitiveSelectProps,
  ListBox,
  ListBoxItem,
} from 'react-aria-components';
import { Button } from '../button/button';
import styles from './select.module.scss';

export interface Option {
  label: string;
  id: number | string;
  icon?: ReactElement;
  leadingIconSrc?: string;
  trailingIconSrc?: string;
}

export interface SelectProps<T extends Option>
  extends Omit<PrimitiveSelectProps<T>, 'children'> {
  label?: string;
  description?: string;
  items: Option[];
  buttonClassName?: string;
  buttonVariant?: 'primary' | 'secondary' | 'danger';
  customTrigger?: ReactNode;
  className?: string;
}

export const Select: FC<SelectProps<Option>> = ({
  items,
  selectedKey,
  defaultSelectedKey,
  label,
  buttonClassName,
  buttonVariant = 'secondary',
  isDisabled,
  customTrigger,
  className,
  onSelectionChange,
  ...props
}) => (
  <PrimitiveSelect
    selectedKey={selectedKey}
    defaultSelectedKey={defaultSelectedKey}
    aria-label={label}
    className={className}
    onSelectionChange={onSelectionChange}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  >
    {label && <Label className={styles.label}>{label}</Label>}
    {customTrigger || (
      <Button
        variant={buttonVariant}
        className={`${styles.selectButton} ${buttonClassName || ''}`}
        isDisabled={isDisabled}
      >
        <SelectValue className={styles.selectValue} />
        {!isDisabled && (
          <svg
            className={styles.caretIcon}
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M3 4.5L6 7.5L9 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </Button>
    )}
    <Popover placement="bottom end" className={styles.selectPopoverWrapper}>
      <ListBox items={items} className={styles.selectPopover}>
        {items.map((item) => {
          const { label: itemLabel } = item;
          return (
            <ListBoxItem
              key={item.id}
              id={item.id.toString()}
              className={styles.selectItem}
            >
              {itemLabel}
            </ListBoxItem>
          );
        })}
      </ListBox>
    </Popover>
  </PrimitiveSelect>
);
