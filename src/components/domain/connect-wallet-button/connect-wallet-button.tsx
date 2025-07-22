import { FC, ReactElement } from 'react';
import {
  ButtonSize,
  ButtonVariant,
  Spinner,
  SpinnerVariant,
  Button,
  useMediaQuery,
  Breakpoint,
} from '@pufferfinance/puffer-ui-components';
import { useAppKit, useAppKitState } from '@reown/appkit/react';
import { useTranslation } from 'react-i18next';
import { truncateAddress } from '@/utils/truncate-address';
import { useWeb3 } from '@/context/web3-context/web3-context';
import { useConnectWalletToast } from './lib/use-connect-wallet-toast';

interface ConnectWalletButtonProps {
  onPressWhenConnected?: () => void;
  Icon?: ReactElement;
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  setIsMenuOpen?: (state: boolean) => void;
}

/*
 * Connects a wallet using the Web3Context, and handles loading.
 * Optional prop onPressWhenConnected to e.g. trigger popovers.
 * A toast is displayed on connection.
 */
export const ConnectWalletButton: FC<ConnectWalletButtonProps> = ({
  onPressWhenConnected,
  Icon,
  label,
  variant = ButtonVariant.CTA,
  size = ButtonSize.Medium,
  setIsMenuOpen,
}) => {
  const { t } = useTranslation();
  const { address, isConnected, isConnecting } = useWeb3();
  const { open: openConnectModal } = useAppKit();
  const { open: isWalletModalOpen } = useAppKitState();
  const isSmallScreen = useMediaQuery(Breakpoint.mobile);
  useConnectWalletToast();

  const isLoading = isConnecting && isWalletModalOpen;

  if (isLoading) {
    return (
      <Button variant={ButtonVariant.CTA} isDisabled>
        <Spinner variant={SpinnerVariant.Small} />
      </Button>
    );
  }

  if (!isConnected) {
    return (
      <Button
        variant={variant}
        size={size}
        onPress={() => {
          if (setIsMenuOpen) setIsMenuOpen(false);
          openConnectModal({ view: 'Connect' });
        }}
      >
        {label ??
          (isSmallScreen
            ? t('CONNECT_WALLET.TITLE_MOBILE')
            : t('CONNECT_WALLET.TITLE'))}
      </Button>
    );
  }

  return (
    <>
      <Button
        variant={ButtonVariant.White}
        onPress={onPressWhenConnected}
        display="flex"
      >
        {isSmallScreen ? '🐠 ' : `🐠 ${truncateAddress(address, 8)} `}
        {Icon}
      </Button>
    </>
  );
};
