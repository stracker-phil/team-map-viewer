import { useSearchParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { searchEntities } from '../utils/derive';
import { EntityLink } from '../components/EntityLink';

export function SearchResults() {
  const [params] = useSearchParams();
  const query = params.get('q') ?? '';
  const { entities } = useData();

  const results = searchEntities(entities, query);

  return (
    <div>
      <div className="page-header">
        <h1>Search results for "{query}"</h1>
        <p>{results.length} result{results.length !== 1 ? 's' : ''}</p>
      </div>

      {results.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🔍</div>
          <h2 className="empty-state__title">No matches</h2>
          <p>Try searching by name, role, or project client.</p>
          <Link to="/" className="btn btn--secondary">Back to overview</Link>
        </div>
      ) : (
        <div className="card search-results">
          {results.map(entity => (
            <div key={entity.id} className="search-result-item">
              <EntityLink entity={entity} />
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{entity.meta}</span>
              <span className={`entity-badge entity-badge--${entity.type} search-result-meta`}>
                {entity.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
