import { StaleLevel } from '../types';

export function staleDays(verified: string): number | null {
	if (!verified) return null;
	const date = new Date(verified);
	if (isNaN(date.getTime())) return null;
	const diff = Date.now() - date.getTime();
	return Math.floor(diff / 86_400_000);
}

export function staleLevel(days: number | null): StaleLevel {
	if (days === null || days < 0) return 'fresh';
	if (days < 30) return 'fresh';
	if (days < 60) return 'warn';
	if (days < 90) return 'old';
	return 'stale';
}

export function staleLabel(days: number | null): string {
	if (days === null) return 'unverified';
	if (days === 0) return 'today';
	if (days === 1) return '1d ago';
	return `${days}d ago`;
}
