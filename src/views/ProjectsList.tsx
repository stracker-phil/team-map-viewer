import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderGit2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { byType, filterClaims, entityMap } from '../utils/derive';

export function ProjectsList() {
  const { entities, claims } = useData();
  const navigate = useNavigate();
  const projects = byType(entities, 'project');
  const map = entityMap(entities);

  const teamSize = useMemo(() => {
    const m: Record<string, number> = {};
    filterClaims(claims, { relation: 'works-on' }).forEach(c => {
      m[c.object] = (m[c.object] ?? 0) + 1;
    });
    return m;
  }, [claims]);

  const squadOf = useMemo(() => {
    const m: Record<string, string> = {};
    filterClaims(claims, { relation: 'owned-by' }).forEach(c => {
      m[c.subject] = c.object;
    });
    return m;
  }, [claims]);

  if (projects.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">No projects yet.</div>
        <h2 className="empty-state__title">No projects yet</h2>
        <p>Import your CSV files to see the project portfolio.</p>
        <button className="btn-primary" onClick={() => navigate('/import')}>Import data</button>
      </div>
    );
  }

  return (
    <div>
      <div className="section-intro">
        <div className="section-intro__eyebrow">PORTFOLIO</div>
        <h2 className="section-intro__title">Projects</h2>
      </div>

      <div className="projects-grid">
        {projects.map(p => {
          const ownerEntity = squadOf[p.id] ? map.get(squadOf[p.id]) : undefined;
          return (
            <button
              key={p.id}
              className="project-card"
              onClick={() => navigate(`/project/${p.id}`)}
            >
              <div className="project-card__top">
                <div style={{ flex: 1 }}>
                  <div className="project-card__eyebrow">
                    {p.meta || 'CLIENT UNKNOWN'}
                  </div>
                  <h3 className="project-card__name">{p.name}</h3>
                </div>
                <span className="project-card__icon"><FolderGit2 size={18} /></span>
              </div>
              <div className="project-card__footer">
                <span>TEAM · {String(teamSize[p.id] ?? 0).padStart(2, '0')}</span>
                {ownerEntity && (
                  <span>OWNER · {ownerEntity.name.toUpperCase()}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
