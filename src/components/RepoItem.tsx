import { Entity, Claim } from '../types';
import { EntityLink } from './EntityLink';
import { EntityPopup } from './EntityPopup';
import { RepoDetailMain } from './RepoDetailMain';
import { StarIndicator } from './StarIndicator';

interface Props {
	repo: Entity;
	claim?: null | Claim;
	detail?: null | string;
	style?: React.CSSProperties;
	disablePopup?: boolean;
}

export function RepoItem({ repo, claim = null, detail = null, style, disablePopup }: Props) {
	return (
		<EntityPopup
			as='li'
			className='entity-item'
			style={style}
			disabled={disablePopup}
			entity={repo}
			meta={repo.meta}
			popup={<RepoDetailMain repoId={repo.id} compact />}
		>
			<StarIndicator entityId={repo.id} />
			<EntityLink entity={repo} />
			{detail && <span className='claim-item__detail'>{detail}</span>}
		</EntityPopup>
	);
}
