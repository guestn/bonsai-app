import type { PutBlobResult } from '@vercel/blob';
import { upload } from '@vercel/blob/client';

function sanitizeFileSegment(name: string): string {
  return name
    .replace(/[/\\]/g, '')
    .replace(/\.\./g, '')
    .trim()
    .slice(0, 200);
}

function blobApiUrl(apiPath: string): string {
  const base = (
    import.meta.env.VITE_VERCEL_BLOB_API_BASE as string | undefined
  )?.replace(/\/$/, '') ?? '';
  const path = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
  return base ? `${base}${path}` : path;
}

export function buildBonsaiPhotoBlobPathname(
  bonsaiId: string,
  fileName: string,
): string {
  const safe = sanitizeFileSegment(fileName) || 'photo.jpg';
  return `bonsai/${bonsaiId}/${Date.now()}-${safe}`;
}

export async function uploadBonsaiPhotoToBlob(
  bonsaiId: string,
  file: File,
  idToken: string,
): Promise<PutBlobResult> {
  const pathname = buildBonsaiPhotoBlobPathname(bonsaiId, file.name);

  return upload(pathname, file, {
    access: 'public',
    handleUploadUrl: blobApiUrl('/api/blob-upload'),
    clientPayload: JSON.stringify({ bonsaiId }),
    headers: { Authorization: `Bearer ${idToken}` },
    contentType: file.type || undefined,
  });
}

export async function deleteBonsaiBlobFromStore(
  blobUrl: string,
  idToken: string,
): Promise<void> {
  const res = await fetch(blobApiUrl('/api/blob-delete'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ url: blobUrl }),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error || `Delete failed: ${res.status}`);
  }
}

function readImageDimensions(
  file: File,
): Promise<{ width: number; height: number } | undefined> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      URL.revokeObjectURL(objectUrl);
      resolve(
        width > 0 && height > 0 ? { width, height } : undefined,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(undefined);
    };
    img.src = objectUrl;
  });
}

export async function getPhotoMetadataFromFile(file: File): Promise<{
  width?: number;
  height?: number;
}> {
  const dimensions = await readImageDimensions(file);
  return dimensions ?? {};
}
