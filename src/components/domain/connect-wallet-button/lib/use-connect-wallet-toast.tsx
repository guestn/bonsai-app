import {
  MessageBannerVariant,
  useToastContext,
} from '@pufferfinance/puffer-ui-components';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useWeb3 } from '@/context/web3-context/web3-context';

export const useConnectWalletToast = () => {
  const toastState = useToastContext();
  const { isConnected, isDisconnected, connector } = useWeb3();
  const { t } = useTranslation();
  const hasShownToastRef = useRef(false);

  useEffect(() => {
    if (isConnected && !hasShownToastRef.current) {
      hasShownToastRef.current = true;
      toastState.add(
        {
          label: t(
            'CONNECT_WALLET.CONNECT_TOAST_MESSAGE',
            '{{walletName}} Wallet connected!',
            {
              walletName: connector.name ?? '',
            },
          ),
          variant: MessageBannerVariant.Info,
        },
        { timeout: 3000 },
      );
    }

    if (isDisconnected) {
      hasShownToastRef.current = false;
    }
  }, [isConnected, isDisconnected, connector?.name, t, toastState]);
};
