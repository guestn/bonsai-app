import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import {
  verifyAuthorizedFirebaseUser,
  isAllowedBonsaiBlobPath,
} from './verify-auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body as HandleUploadBody;

  try {
    const user = await verifyAuthorizedFirebaseUser(req.headers.authorization);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const jsonResponse = await handleUpload({
      request: req,
      body,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let bonsaiId: string | undefined;

        try {
          bonsaiId = JSON.parse(clientPayload || '{}').bonsaiId as
            | string
            | undefined;
        } catch {
          throw new Error('Invalid client payload');
        }

        if (!bonsaiId || typeof bonsaiId !== 'string') {
          throw new Error('Missing bonsai id');
        }

        if (!isAllowedBonsaiBlobPath(pathname, bonsaiId)) {
          throw new Error('Invalid pathname');
        }

        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
          ],
          addRandomSuffix: true,
          maximumSizeInBytes: 15 * 1024 * 1024,
          token: process.env.BLOB_READ_WRITE_TOKEN,
        };
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Upload token error';
    return res.status(400).json({ error: message });
  }
}
