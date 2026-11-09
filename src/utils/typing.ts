export function formatTypingIndicator(names: string[]): string {
  const unique = [...new Set(names)];
  if (unique.length === 0) return '';
  if (unique.length === 1) return `${unique[0]} está digitando...`;
  if (unique.length === 2) return `${unique[0]} e ${unique[1]} estão digitando...`;
  return 'Várias pessoas estão digitando...';
}
