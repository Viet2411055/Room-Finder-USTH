export function optimizeImageUrl(source: string, width: number): string {
  if (!source || source.startsWith('data:') || source.startsWith('blob:')) return source;
  try {
    const url = new URL(source, window.location.origin);
    if (url.hostname.endsWith('muscache.com')) {
      url.searchParams.set('im_w', String(width));
      return url.toString();
    }
    if (url.hostname === 'images.unsplash.com') {
      url.searchParams.set('auto', 'format');
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('w', String(width));
      if (!url.searchParams.has('q')) url.searchParams.set('q', '80');
      return url.toString();
    }
    return source;
  } catch {
    return source;
  }
}
