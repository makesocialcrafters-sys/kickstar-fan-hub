export function formatEuro(cents: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}

export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function relativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (seconds < 60) return 'gerade eben';
  if (minutes < 60) return `vor ${minutes} Minute${minutes !== 1 ? 'n' : ''}`;
  if (hours < 24) return `vor ${hours} Stunde${hours !== 1 ? 'n' : ''}`;
  if (days < 7) return `vor ${days} Tag${days !== 1 ? 'en' : ''}`;
  if (weeks < 4) return `vor ${weeks} Woche${weeks !== 1 ? 'n' : ''}`;
  return new Date(dateStr).toLocaleDateString('de-DE');
}
