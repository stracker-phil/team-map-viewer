import { Entity, Claim } from '../types';
import { EntityLink } from './EntityLink';
import { StaleTag } from './StaleTag';
import { EntityPopup } from './EntityPopup';
import { ProjectDetailMain } from './ProjectDetailMain';
import { StarIndicator } from './StarIndicator';

interface Props {
	project: Entity;
	claim?: null | Claim;
	detail?: null | string;
	style?: React.CSSProperties;
	disablePopup?: boolean;
}

export function ProjectItem({ project, claim = null, detail = null, style, disablePopup }: Props) {
	return (
		<EntityPopup
			as='li'
			className='entity-item'
			style={style}
			disabled={disablePopup}
			popup={<ProjectDetailMain projectId={project.id} compact />}
		>
			<StarIndicator entityId={project.id} />
			<EntityLink entity={project} />
			{detail && <span className='claim-item__detail'>{detail}</span>}
			{claim && <StaleTag verified={claim.verified} />}
		</EntityPopup>
	);
}
