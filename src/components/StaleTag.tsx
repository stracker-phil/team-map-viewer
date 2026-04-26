import { staleDays, staleLevel } from '../utils/stale';

interface Props {
	verified: string;
}

export function StaleTag({ verified }: Props) {
	const days = staleDays(verified);
	const level = staleLevel(days);

	let label: string;
	if (days === null) {
		label = 'No verification date';
	} else {
		label = `Last verified ${verified} (${days} day${days === 1 ? '' : 's'} ago)`;
	}

	return (
		<span
			className={`stale-dot stale-dot--${level}`}
			title={label}
		/>
	);
}
