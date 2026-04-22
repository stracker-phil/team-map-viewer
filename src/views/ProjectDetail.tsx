import { useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { entityMap, filterClaims } from '../utils/derive';
import { EntityLink } from '../components/EntityLink';
import { StaleTag } from '../components/StaleTag';
import { Entity, Claim } from '../types';
import { Link } from 'react-router-dom';

const ROLE_ORDER = ['PM', 'PO', 'TL', 'dev', 'QA', ''];

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { entities, claims } = useData();
  const map = entityMap(entities);
  const project = id ? map.get(id) : undefined;

  if (!project || project.type !== 'project') {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">❓</div>
        <h2 className="empty-state__title">Project not found</h2>
        <p>ID: {id}</p>
        <Link to="/" className="btn btn--secondary">Back to overview</Link>
      </div>
    );
  }

  const ownerClaim = filterClaims(claims, { subject: project.id, relation: 'owned-by' })[0];
  const owningTeam = ownerClaim ? map.get(ownerClaim.object) : undefined;

  const worksClaims = filterClaims(claims, { relation: 'works-on', object: project.id });

  const grouped = groupByRole(worksClaims);

  return (
    <div>
      <Link to="/" className="back-link">← Team Overview</Link>

      <div className="detail-header">
        <div className="detail-header__tag">
          <span className="entity-badge entity-badge--project">project</span>
        </div>
        <h1 className="detail-header__name">{project.name}</h1>
        {project.meta && (
          <div className="detail-header__meta">Client / context: {project.meta}</div>
        )}
      </div>

      <div className="detail-layout">
        <aside>
          {owningTeam && (
            <div className="detail-section">
              <div className="detail-section__title">Owned by</div>
              <EntityLink entity={owningTeam} />
              {ownerClaim && <StaleTag verified={ownerClaim.verified} />}
            </div>
          )}

          <div className="detail-section">
            <div className="detail-section__title">Stats</div>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>
              {worksClaims.length} team member{worksClaims.length !== 1 ? 's' : ''}
            </p>
          </div>
        </aside>

        <div>
          <div className="card">
            <div className="card__title">Team</div>
            {worksClaims.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: 13 }}>No members recorded.</p>
            ) : (
              ROLE_ORDER.filter(role => grouped[role]?.length).map(role => (
                <RoleGroup key={role || '_other'} role={role} claimsWithEntity={grouped[role]} entityMap={map} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function groupByRole(claims: Claim[]): Record<string, Claim[]> {
  const result: Record<string, Claim[]> = {};
  for (const c of claims) {
    const key = c.detail || '';
    (result[key] ??= []).push(c);
  }
  return result;
}

function RoleGroup({
  role,
  claimsWithEntity,
  entityMap: map,
}: {
  role: string;
  claimsWithEntity: Claim[];
  entityMap: Map<string, Entity>;
}) {
  return (
    <div className="project-team-role-group">
      {claimsWithEntity.map(c => {
        const person = map.get(c.subject);
        if (!person) return null;
        return (
          <div key={c.subject} className="claim-row">
            <span className="detail-role">{role || '—'}</span>
            <div className="claim-row__label">
              <EntityLink entity={person} />
            </div>
            <StaleTag verified={c.verified} always />
          </div>
        );
      })}
    </div>
  );
}
