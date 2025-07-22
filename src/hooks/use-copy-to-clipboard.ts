import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

type CopiedValue = string | null;

type CopyFn = (text: string) => Promise<boolean>;

export function useCopyToClipboard(): {
  copiedText: CopiedValue;
  copy: CopyFn;
} {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);
  const { t } = useTranslation();

  const copy: CopyFn = useCallback(
    async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedText(text);

        return true;
      } catch (error) {
        setCopiedText(null);
        return false;
      }
    },
    [t],
  );

  return { copiedText, copy };
}
