import { FC, useState } from 'react';
import {
  ButtonVariant,
  Spinner,
  SpinnerVariant,
  Text,
  View,
  Link,
  Button,
  joinClasses,
  spacing,
  MessageBannerVariant,
  useToastContext,
} from '@pufferfinance/puffer-ui-components';
import { useDisconnect, useAccount, useChainId } from 'wagmi';
import { useTranslation } from 'react-i18next';
import { truncateAddress } from '@/utils/truncate-address';
import { chainExplorerUrls } from '@/utils/chain-explorer';
import styles from './connected-wallet-summary.module.scss';

interface ConnectedWalletSummaryProps {
  setIsMenuOpen?: (state: boolean) => void;
}

export const ConnectedWalletSummary: FC<ConnectedWalletSummaryProps> = ({
  setIsMenuOpen,
}) => {
  const { address, connector } = useAccount();
  const chainId = useChainId();
  const { disconnectAsync } = useDisconnect();
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const toastState = useToastContext();

  const { t } = useTranslation();

  const CHAIN_EXPLORER_URL = `${chainExplorerUrls[chainId]}/address/${address}`;

  return (
    <>
      <View alignItems="center" flexDirection="column" gap={spacing(4)}>
        <Text className={styles.emoji}>{'🐠'}</Text>
        <Link
          href={CHAIN_EXPLORER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={joinClasses(styles.addressLink)}
        >
          {truncateAddress(address, 8)}
        </Link>
      </View>
      <Button
        display="flex"
        variant={ButtonVariant.Border}
        onPress={async () => {
          setIsDisconnecting(true);
          await disconnectAsync();
          setIsDisconnecting(false);

          if (setIsMenuOpen) setIsMenuOpen(false);

          toastState.add(
            {
              label: t('CONNECT_WALLET.DISCONNECT_TOAST_MESSAGE', {
                walletName: connector?.name ?? '',
              }),
              variant: MessageBannerVariant.Info,
            },
            {
              timeout: 3000,
            },
          );
        }}
      >
        {isDisconnecting && (
          <Spinner inline inverted variant={SpinnerVariant.Small} />
        )}
        {t('CONNECT_WALLET.BUTTONS.DISCONNECT')}
      </Button>
    </>
  );
};
