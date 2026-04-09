import type { VercelRequest, VercelResponse } from '@vercel/node';
import { del } from '@vercel/blob';
import { verifyAuthorizedFirebaseUser } from './verify-auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await verifyAuthorizedFirebaseUser(req.headers.authorization);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const url = (req.body as { url?: string })?.url;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url' });
  }

  if (
    !url.startsWith('https://') ||
    !url.includes('.blob.vercel-storage.com/')
  ) {
    return res.status(400).json({ error: 'Invalid blob url' });
  }

  try {
    await del(url);
    return res.status(200).json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to delete blob';
    return res.status(400).json({ error: message });
  }
}
