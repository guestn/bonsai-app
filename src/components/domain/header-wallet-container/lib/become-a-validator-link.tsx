import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { LinkButton, ButtonVariant } from '@pufferfinance/puffer-ui-components';

interface BecomeAValidatorLinkProps {
  variant?: ButtonVariant;
}

export const BecomeAValidatorLink: FC<BecomeAValidatorLinkProps> = ({
  variant = ButtonVariant.Border,
}) => {
  const { t } = useTranslation();

  return (
    <LinkButton href="/" variant={variant}>
      {t('BECOME_A_VALIDATOR')}
    </LinkButton>
  );
};
