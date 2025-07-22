import {
  MessageBannerVariant,
  useToastContext,
} from '@pufferfinance/puffer-ui-components';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

type CopiedValue = string | null;

type CopyFn = (text: string) => Promise<boolean>;

export function useCopyToClipboard(): {
  copiedText: CopiedValue;
  copy: CopyFn;
} {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);
  const toastState = useToastContext();
  const { t } = useTranslation();

  const copy: CopyFn = useCallback(
    async (text) => {
      if (!navigator?.clipboard) {
        toastState.add(
          {
            label: t('COPY_CLIPBOARD.WARNING'),
            variant: MessageBannerVariant.Warning,
          },
          { timeout: 3000 },
        );

        return false;
      }

      // Try to save to clipboard then save it in the state if worked
      try {
        await navigator.clipboard.writeText(text);
        setCopiedText(text);
        toastState.add(
          {
            label: t('COPY_CLIPBOARD.SUCCESS'),
            variant: MessageBannerVariant.Info,
          },
          { timeout: 3000 },
        );
        return true;
      } catch (error) {
        toastState.add(
          {
            label: t('COPY_CLIPBOARD.ERROR'),
            variant: MessageBannerVariant.Error,
          },
          { timeout: 3000 },
        );
        setCopiedText(null);
        return false;
      }
    },
    [t, toastState],
  );

  return { copiedText, copy };
}
