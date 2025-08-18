export function formatDistanceToNow(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatDuration(ms: number): string {
  if (ms <= 0) return 'Ready to develop';

  const hours = Math.floor(ms / (1000 * 60 * 60));
  
  if (hours >= 1) {
    return `${hours}h left`;
  }

  const totalMinutes = Math.floor(ms / (1000 * 60));
  if (totalMinutes < 1) {
      return '<1 min left';
  }
  return `${totalMinutes} min left`;
}