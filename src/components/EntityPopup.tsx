import { useState, useRef, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Boxes, FolderGit2, GitBranch } from 'lucide-react';
import { Avatar } from './Avatar';
import type { Entity } from '../types';

const OPEN_DELAY = 1000;
const CLOSE_DELAY = 50;
const POPUP_WIDTH = 680;
const VIEWPORT_MARGIN = 16;
const POPUP_GAP = 0;
const POPUP_HEIGHT_ESTIMATE = 360;

interface Props {
	entity: Entity;
	meta?: string | null;
	popup: React.ReactNode;
	children: React.ReactNode;
	as?: keyof React.JSX.IntrinsicElements;
	className?: string;
	style?: React.CSSProperties;
	disabled?: boolean;
	onClick?: React.MouseEventHandler;
}

function HeaderIcon({ entity }: { entity: Entity }) {
	if (entity.type === 'person') return <Avatar name={entity.name} id={entity.id} size='sm' />;
	if (entity.type === 'project') return <FolderGit2 size={14} className='popup__icon' />;
	if (entity.type === 'repo') return <GitBranch size={14} className='popup__icon' />;
	return <span className='popup__icon'><Boxes size={16} /></span>;
}

export function EntityPopup({ entity, meta, popup, children, as, className, style, disabled, onClick }: Props) {
	const [open, setOpen] = useState(false);
	const [pos, setPos] = useState({ top: 0, left: 0 });
	const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const triggerRef = useRef<HTMLElement | null>(null);
	const popupRef = useRef<HTMLDivElement | null>(null);
	// Computed once on open, not recalculated on scroll.
	const openAbove = useRef(false);
	// Stores mouse Y at hover time; null when opened via keyboard focus.
	const mouseTop = useRef<number | null>(null);
	const Tag = (as ?? 'div') as React.ElementType;

	const reposition = useCallback(() => {
		const el = triggerRef.current;
		if (!el) return;
		const rect = el.getBoundingClientRect();
		const popupHeight = popupRef.current?.offsetHeight ?? POPUP_HEIGHT_ESTIMATE;
		const anchorY = mouseTop.current ?? (openAbove.current ? rect.top : rect.bottom);
		const leftViewport = Math.max(VIEWPORT_MARGIN, Math.min(rect.left, window.innerWidth - POPUP_WIDTH - VIEWPORT_MARGIN));
		const top = openAbove.current
			? anchorY + window.scrollY - POPUP_GAP - popupHeight
			: anchorY + window.scrollY + POPUP_GAP;
		const left = leftViewport + window.scrollX;
		setPos({ top, left });
	}, []);

	function cancelClose() {
		if (closeTimer.current) clearTimeout(closeTimer.current);
	}

	function scheduleClose() {
		if (openTimer.current) clearTimeout(openTimer.current);
		if (closeTimer.current) clearTimeout(closeTimer.current);
		closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY);
	}

	function show(e: React.MouseEvent | React.FocusEvent) {
		if (disabled) return;
		cancelClose();
		const el = e.currentTarget as HTMLElement;
		triggerRef.current = el;
		// null for keyboard focus; mouse Y set here and kept fresh via onMouseMove.
		if (e.type !== 'mouseenter') mouseTop.current = null;
		if (openTimer.current) clearTimeout(openTimer.current);
		openTimer.current = setTimeout(() => {
			const trigger = triggerRef.current;
			if (!trigger) return;
			const rect = trigger.getBoundingClientRect();
			const anchorYBottom = mouseTop.current ?? rect.bottom;
			// Decide above/below once based on page layout, not recalculated on scroll.
			const pageAbsBottom = anchorYBottom + window.scrollY;
			openAbove.current = pageAbsBottom + POPUP_GAP + POPUP_HEIGHT_ESTIMATE > document.documentElement.scrollHeight;
			reposition();
			setOpen(true);
		}, OPEN_DELAY);
	}

	function handleBlur(e: React.FocusEvent) {
		if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
			scheduleClose();
		}
	}

	// Correct top using actual popup height after mount (runs before paint, no flash).
	useLayoutEffect(() => {
		if (!open) return;
		reposition();
	}, [open, reposition]);

	return (
		<Tag
			className={`popup-trigger${className ? ` ${className}` : ''}`}
			style={style}
			onMouseEnter={show}
			onMouseMove={(e: React.MouseEvent) => { mouseTop.current = e.clientY; }}
			onMouseLeave={scheduleClose}
			onFocus={show}
			onBlur={handleBlur}
			onClick={onClick}
		>
			{children}
			{open && !disabled && createPortal(
				<div
					ref={popupRef}
					className='popup'
					style={{ top: pos.top, left: pos.left }}
					onMouseEnter={cancelClose}
					onMouseLeave={scheduleClose}
					onClick={e => e.stopPropagation()}
				>
					<Link to={`/${entity.type}/${entity.id}`} className='popup__header popup__header--linked'>
						<HeaderIcon entity={entity} />
						<span className='font-display popup__name'>{entity.name}</span>
						{meta && <span className='popup__meta'>{meta}</span>}
					</Link>
					{popup}
				</div>,
				document.body,
			)}
		</Tag>
	);
}
