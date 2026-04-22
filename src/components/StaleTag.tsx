import { staleDays, staleLevel, staleLabel } from '../utils/stale';

interface Props {
  verified: string;
  always?: boolean; // show even when fresh
}

export function StaleTag({ verified, always }: Props) {
  const days = staleDays(verified);
  const level = staleLevel(days);
  if (!always && level === 'fresh') return null;

  return (
    <span
      className={`stale-tag stale-tag--${level}`}
      title={verified ? `Last verified: ${verified}` : 'No verification date'}
    >
      {staleLabel(days)}
    </span>
  );
}
