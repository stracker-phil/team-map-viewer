interface AvatarProps {
	name: string;
	id: string;
	size?: 'sm' | 'md' | 'lg';
}

function hashId(s: string): number {
	let h = 0;
	for (let i = 0; i < s.length; i++) {
		h = (s.charCodeAt(i) + ((h << 5) - h)) | 0;
	}
	return Math.abs(h);
}

function initials(name: string): string {
	const words = name.trim().split(/\s+/);
	if (words.length >= 2) return (words[0][0] + words[words.length - 1][0]).toUpperCase();
	return name.slice(0, 2).toUpperCase();
}

export function Avatar({ name, id, size = 'sm' }: AvatarProps) {
	const hue = hashId(id) % 360;
	return (
		<span
			className={`avatar avatar--${size}`}
			style={{ background: `hsl(${hue}, 35%, 72%)` }}
			aria-label={name}
		>
      {initials(name)}
    </span>
	);
}
