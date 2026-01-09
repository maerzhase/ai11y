import React, { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface AssistBubbleProps {
	elementRef: React.RefObject<HTMLElement | null>;
	message: string;
	label: string;
	id: string;
	isPanelOpen: boolean;
	setIsPanelOpen: (open: boolean) => void;
	openPanelWithMessage: (message: string, anchor?: HTMLElement | null) => void;
}

export function AssistBubble({
	elementRef,
	message,
	label,
	id,
	isPanelOpen,
	setIsPanelOpen,
	openPanelWithMessage,
}: AssistBubbleProps) {
	const buttonRef = useRef<HTMLButtonElement | null>(null);
	const [bubblePos, setBubblePos] = useState<{
		top: number;
		left: number;
		visible: boolean;
	}>({ top: 0, left: 0, visible: false });

	useLayoutEffect(() => {
		if (typeof window === "undefined") return;

		let raf = 0;
		let resizeObserver: ResizeObserver | null = null;

		const updatePosition = () => {
			const el = elementRef.current;
			if (!el) {
				setBubblePos((prev) =>
					prev.visible ? { ...prev, visible: false } : prev,
				);
				return;
			}

			const rect = el.getBoundingClientRect();
			const size = 22;

			const inViewport =
				rect.width > 0 &&
				rect.height > 0 &&
				rect.bottom > 0 &&
				rect.right > 0 &&
				rect.top < window.innerHeight &&
				rect.left < window.innerWidth;

			if (!inViewport) {
				setBubblePos((prev) =>
					prev.visible ? { ...prev, visible: false } : prev,
				);
				return;
			}

			const top = rect.bottom - size / 2;
			const left = rect.right - size / 2;

			setBubblePos({ top, left, visible: true });
		};

		const scheduleUpdate = () => {
			if (raf) return;
			raf = window.requestAnimationFrame(() => {
				raf = 0;
				updatePosition();
			});
		};

		updatePosition();

		window.addEventListener("scroll", scheduleUpdate, true);
		window.addEventListener("resize", scheduleUpdate);

		if ("ResizeObserver" in window && elementRef.current) {
			resizeObserver = new ResizeObserver(scheduleUpdate);
			resizeObserver.observe(elementRef.current);
		}

		return () => {
			window.removeEventListener("scroll", scheduleUpdate, true);
			window.removeEventListener("resize", scheduleUpdate);
			resizeObserver?.disconnect();
			if (raf) window.cancelAnimationFrame(raf);
		};
	}, [elementRef]);

	if (!bubblePos.visible || typeof document === "undefined") {
		return null;
	}

	return createPortal(
		<button
			ref={buttonRef}
			type="button"
			aria-label={`Ask agent about ${label || id}`}
			onPointerDown={(e) => {
				e.preventDefault();
				e.stopPropagation();
				e.nativeEvent.stopImmediatePropagation();

				const wasOpen = isPanelOpen;
				if (wasOpen) {
					setIsPanelOpen(false);
				} else {
					openPanelWithMessage(message, buttonRef.current);
				}
			}}
			onMouseDown={(e) => {
				e.preventDefault();
				e.stopPropagation();
			}}
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
			}}
			style={{
				position: "fixed",
				top: bubblePos.top,
				left: bubblePos.left,
				width: 22,
				height: 22,
				borderRadius: 9999,
				border: "1px solid rgba(255,255,255,0.18)",
				background: "rgba(15, 23, 42, 0.92)",
				color: "white",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				boxShadow: "0 10px 20px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.18)",
				zIndex: 10001,
				cursor: "pointer",
				padding: 0,
			}}
		>
			<svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<path
					d="M20 12c0 3.866-3.582 7-8 7a9.8 9.8 0 0 1-2.4-.296L5 20l.98-3.1C4.734 15.66 4 13.9 4 12c0-3.866 3.582-7 8-7s8 3.134 8 7Z"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinejoin="round"
				/>
				<path
					d="M8 12h.01M12 12h.01M16 12h.01"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
				/>
			</svg>
		</button>,
		document.body,
	);
}
