import { Entity, Claim } from '../types';
import { useData } from '../context/DataContext';
import { EntityLink } from './EntityLink';
import { Avatar } from './Avatar';
import { EntityPopup } from './EntityPopup';
import { PersonDetailMain } from './PersonDetailMain';
import { StarIndicator } from './StarIndicator';

interface Props {
	person: Entity;
	claim?: null | Claim;
	detail?: null | string;
	style?: React.CSSProperties;
}

export function PersonItem({ person, claim = null, detail = null, style }: Props) {
	const { personRoleMap } = useData();
	const role = personRoleMap.get(person.id) ?? person.meta;
	return (
		<EntityPopup
			as='li'
			className='entity-item'
			style={style}
			entity={person}
			meta={role}
			popup={<PersonDetailMain personId={person.id} compact />}
		>
			<Avatar name={person.name} id={person.id} size='sm' />
			<StarIndicator entityId={person.id} />
			<EntityLink entity={person} />
			{detail && <span className='claim-item__detail'>{detail}</span>}
		</EntityPopup>
	);
}
