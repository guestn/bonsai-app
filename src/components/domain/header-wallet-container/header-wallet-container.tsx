import { FC, useRef, useState } from 'react';
import {
  Popover,
  Dialog,
  CaretDownIcon,
  CaretUpIcon,
  Text,
  spacing,
  View,
  useMediaQuery,
  ChainIcon,
  Breakpoint,
} from '@pufferfinance/puffer-ui-components';
import { useTranslation } from 'react-i18next';
import { useWeb3 } from '@/context/web3-context/web3-context';
import { ConnectedWalletSummary } from '@/components/domain/connected-wallet-summary/connected-wallet-summary';
import { ConnectWalletButton } from '@/components/domain/connect-wallet-button/connect-wallet-button';
import styles from './header-wallet-container.module.scss';

interface HeaderWalletContainerProps {}

export const HeaderWalletContainer: FC<HeaderWalletContainerProps> = () => {
  const { isConnected, chain } = useWeb3();
  const { t } = useTranslation();
  const isSmallScreen = useMediaQuery(Breakpoint.mobile);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const triggerRef = useRef(null);

  return (
    <View
      className={styles.headerWalletContainer}
      ref={triggerRef}
      alignItems="center"
      gap={isSmallScreen ? spacing(2) : spacing(5)}
    >
      {isConnected && chain?.name && (
        <View gap={3} alignItems="center">
          <ChainIcon name={chain.name} size={32} />
          {chain.id !== 1 && !isSmallScreen && <Text>{chain.name}</Text>}
        </View>
      )}
      <ConnectWalletButton
        onPressWhenConnected={() => setIsPopoverOpen((x) => !x)}
        Icon={isPopoverOpen ? <CaretUpIcon /> : <CaretDownIcon />}
      />
      {isConnected && (
        <Popover
          placement="top right"
          containerPadding={0}
          offset={spacing(5)}
          triggerRef={triggerRef}
          isOpen={isPopoverOpen}
          onOpenChange={setIsPopoverOpen}
        >
          <Dialog
            className={styles.dialogContainer}
            aria-label={t('CONNECT_WALLET.WALLET_DIALOG_LABEL')}
          >
            <ConnectedWalletSummary setIsMenuOpen={setIsPopoverOpen} />
          </Dialog>
        </Popover>
      )}
    </View>
  );
};
