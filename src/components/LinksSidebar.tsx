import {
	Hash,
	BookOpen,
	Globe,
	Package,
	UserCheck,
	GitBranch,
	ExternalLink,
	LayoutList,
} from 'lucide-react';
import { Claim, Entity } from '../types';

const TYPE_ORDER = ['jira', 'slack', 'confluence', 'github', 'website', 'wporg', 'personio'];

const TYPE_LABELS: Record<string, string> = {
	jira: 'Jira',
	slack: 'Slack',
	confluence: 'Confluence',
	github: 'GitHub',
	website: 'Website',
	wporg: 'WordPress.org',
	personio: 'Personio',
};

function LinkIcon({ type }: { type: string }) {
	switch (type) {
		case 'jira':
			return <LayoutList size={13} />;
		case 'slack':
			return <Hash size={13} />;
		case 'confluence':
			return <BookOpen size={13} />;
		case 'github':
			return <GitBranch size={13} />;
		case 'website':
			return <Globe size={13} />;
		case 'wporg':
			return <Package size={13} />;
		case 'personio':
			return <UserCheck size={13} />;
		default:
			return <ExternalLink size={13} />;
	}
}

interface LinkEntry {
	url: string;
	label: string;
	linkType: string;
}

function ghLinkFromRepo(entity: Entity): LinkEntry | null {
	if (entity.type !== 'repo') return null;
	if (!/^[^/]+\/[^/]+$/.test(entity.name)) return null;
	return {
		linkType: 'github',
		url: `https://github.com/${entity.name}`,
		label: entity.name,
	};
}

interface Props {
	claims: Claim[];
	entityId: string;
	entity?: Entity;
}

export function LinksSidebar({ claims, entityId, entity }: Props) {
	const synthetic = entity ? ghLinkFromRepo(entity) : null;

	const linkEntries: LinkEntry[] = [
		...(synthetic ? [synthetic] : []),
		...claims
			.filter(c => c.relation === 'link' && c.subject === entityId)
			.map(c => ({ url: c.object, label: c.detail, linkType: c.source })),
	];

	const groups = new Map<string, LinkEntry[]>();
	for (const entry of linkEntries) {
		if (!groups.has(entry.linkType)) groups.set(entry.linkType, []);
		groups.get(entry.linkType)!.push(entry);
	}

	const orderedTypes = [
		...TYPE_ORDER.filter(t => groups.has(t)),
		...[...groups.keys()].filter(t => !TYPE_ORDER.includes(t)),
	];

	return (
		<aside className='detail-sidebar'>
			<div className='links-sidebar__heading'>LINKS</div>

			{orderedTypes.length === 0 ? (
				<p className='links-sidebar__empty'>No links recorded yet.</p>
			) : (
				orderedTypes.map(type => (
					<div key={type} className='links-group'>
						<div className='links-group__type'>
							{TYPE_LABELS[type] || type.toUpperCase()}
						</div>
						{groups.get(type)!.map((entry, i) => (
							<div key={i} className='link-item'>
                <span className='link-item__icon'>
                  <LinkIcon type={type} />
                </span>
								<a href={entry.url} target='_blank' rel='noopener noreferrer'>
									{entry.label}
								</a>
							</div>
						))}
					</div>
				))
			)}
		</aside>
	);
}
