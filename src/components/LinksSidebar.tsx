import { Hash, BookOpen, Globe, Package, UserCheck, GitBranch, ExternalLink, LayoutList } from 'lucide-react';
import { Link } from '../types';

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
    case 'jira': return <LayoutList size={13} />;
    case 'slack': return <Hash size={13} />;
    case 'confluence': return <BookOpen size={13} />;
    case 'github': return <GitBranch size={13} />;
    case 'website': return <Globe size={13} />;
    case 'wporg': return <Package size={13} />;
    case 'personio': return <UserCheck size={13} />;
    default: return <ExternalLink size={13} />;
  }
}

interface Props {
  links: Link[];
  entityId: string;
}

export function LinksSidebar({ links, entityId }: Props) {
  const entityLinks = links.filter(l => l.entity_id === entityId);

  const groups = new Map<string, Link[]>();
  for (const link of entityLinks) {
    if (!groups.has(link.type)) groups.set(link.type, []);
    groups.get(link.type)!.push(link);
  }

  const orderedTypes = [
    ...TYPE_ORDER.filter(t => groups.has(t)),
    ...[...groups.keys()].filter(t => !TYPE_ORDER.includes(t)),
  ];

  return (
    <aside className="detail-sidebar">
      <div className="links-sidebar__heading">LINKS</div>

      {orderedTypes.length === 0 ? (
        <p className="links-sidebar__empty">No links recorded yet.</p>
      ) : (
        orderedTypes.map(type => (
          <div key={type} className="links-group">
            <div className="links-group__type">
              {TYPE_LABELS[type] || type.toUpperCase()}
            </div>
            {groups.get(type)!.map((link, i) => (
              <div key={i} className="link-item">
                <span className="link-item__icon">
                  <LinkIcon type={type} />
                </span>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              </div>
            ))}
          </div>
        ))
      )}
    </aside>
  );
}
