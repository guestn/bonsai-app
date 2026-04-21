import type { PhotoMetadata } from '../types/bonsai';

/** Calendar date shown for a photo: EXIF / edited `takenAt`, else upload time. */
export function getPhotoDisplayDate(photo: PhotoMetadata): string {
  return photo.takenAt ?? photo.uploadedAt;
}

export function toDateInputValue(isoLike: string): string {
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) {
    return '';
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Local calendar date at noon → ISO string for storage. */
export function dateInputToTakenAtIso(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) {
    throw new Error('Invalid date');
  }
  return new Date(y, m - 1, d, 12, 0, 0, 0).toISOString();
}

export function sameCalendarDay(a: string, b: string): boolean {
  return toDateInputValue(a) === toDateInputValue(b);
}
