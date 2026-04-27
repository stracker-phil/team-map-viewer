import { useState, useRef, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

const OPEN_DELAY = 1000;
const CLOSE_DELAY = 50;
const POPUP_WIDTH = 680;
const VIEWPORT_MARGIN = 16;
const POPUP_GAP = 6;
const POPUP_HEIGHT_ESTIMATE = 360;

interface Props {
	popup: React.ReactNode;
	children: React.ReactNode;
	as?: keyof React.JSX.IntrinsicElements;
	className?: string;
	style?: React.CSSProperties;
	disabled?: boolean;
	onClick?: React.MouseEventHandler;
}

export function EntityPopup({ popup, children, as, className, style, disabled, onClick }: Props) {
	const [open, setOpen] = useState(false);
	const [pos, setPos] = useState({ top: 0, left: 0 });
	const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const triggerRef = useRef<HTMLElement | null>(null);
	const popupRef = useRef<HTMLDivElement | null>(null);
	// Computed once on open, not recalculated on scroll.
	const openAbove = useRef(false);
	const Tag = (as ?? 'div') as React.ElementType;

	const reposition = useCallback(() => {
		const el = triggerRef.current;
		if (!el) return;
		const rect = el.getBoundingClientRect();
		const popupHeight = popupRef.current?.offsetHeight ?? POPUP_HEIGHT_ESTIMATE;
		const leftViewport = Math.max(VIEWPORT_MARGIN, Math.min(rect.left, window.innerWidth - POPUP_WIDTH - VIEWPORT_MARGIN));
		const top = openAbove.current
			? rect.top + window.scrollY - POPUP_GAP - popupHeight
			: rect.bottom + window.scrollY + POPUP_GAP;
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
		if (openTimer.current) clearTimeout(openTimer.current);
		openTimer.current = setTimeout(() => {
			const trigger = triggerRef.current;
			if (!trigger) return;
			const rect = trigger.getBoundingClientRect();
			// Decide above/below once based on page layout, not recalculated on scroll.
			const pageAbsBottom = rect.bottom + window.scrollY;
			openAbove.current = pageAbsBottom + POPUP_GAP + POPUP_HEIGHT_ESTIMATE > document.documentElement.scrollHeight;
			const leftViewport = Math.max(VIEWPORT_MARGIN, Math.min(rect.left, window.innerWidth - POPUP_WIDTH - VIEWPORT_MARGIN));
			const top = openAbove.current
				? rect.top + window.scrollY - POPUP_GAP - POPUP_HEIGHT_ESTIMATE
				: rect.bottom + window.scrollY + POPUP_GAP;
			const left = leftViewport + window.scrollX;
			setPos({ top, left });
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
					{popup}
				</div>,
				document.body,
			)}
		</Tag>
	);
}
