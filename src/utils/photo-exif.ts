import exifr from 'exifr';

function normalizeExifDate(value: unknown): string | undefined {
  if (value == null) {
    return undefined;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === 'string') {
    const exifLike = value.match(
      /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/,
    );
    if (exifLike) {
      const [, ys, ms, ds, hs, mins, ss] = exifLike;
      const parsed = new Date(
        Number(ys),
        Number(ms) - 1,
        Number(ds),
        Number(hs),
        Number(mins),
        Number(ss),
      );
      return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
  }

  return undefined;
}

/**
 * Best-effort capture time from embedded metadata (JPEG/TIFF WebP with EXIF, etc.).
 * HEIC and some mobile captures may omit readable EXIF in-browser.
 */
export async function getExifTakenAtIso(file: File): Promise<string | undefined> {
  try {
    const tags = await exifr.parse(file, {
      pick: ['DateTimeOriginal', 'CreateDate', 'ModifyDate', 'DateTime'],
    });

    if (!tags || typeof tags !== 'object') {
      return undefined;
    }

    const record = tags as Record<string, unknown>;
    const raw =
      record.DateTimeOriginal ??
      record.CreateDate ??
      record.ModifyDate ??
      record.DateTime;

    return normalizeExifDate(raw);
  } catch {
    return undefined;
  }
}
