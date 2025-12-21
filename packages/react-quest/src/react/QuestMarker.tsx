import { useEffect, useState } from "react";
import { questManager } from "@/lib/manager";
import { computeMarkerForTarget, type Marker } from "@/lib/marker/compute";

export function QuestMarker({
	target,
	rootId = "window",
	label,
}: {
	target: () => HTMLElement | null;
	rootId?: string;
	label?: string;
}) {
	const [marker, setMarker] = useState<Marker | null>(null);
	useEffect(() => {
		let unsub = () => {};
		let raf = 0;
		let active = true;

		const ensureRoot = () => {
			let s = questManager.getState(rootId);
			if (!s && rootId === "window" && typeof window !== "undefined") {
				try {
					questManager.addRoot(window, "window");
				} catch {}
				s = questManager.getState(rootId);
			}
			return s;
		};

		const onState = (s: any) => {
			const el = target();
			if (!el) return;
			const m = computeMarkerForTarget(el, s.width, s.height);
			setMarker(m);
		};

		const start = () => {
			const s0 = ensureRoot();
			if (s0) onState(s0);
			try {
				unsub = questManager.subscribe(rootId, onState);
			} catch {}
		};

		const waitForEl = () => {
			if (!active) return;
			if (target()) {
				start();
				return;
			}
			raf = requestAnimationFrame(waitForEl);
		};

		waitForEl();
		return () => {
			active = false;
			cancelAnimationFrame(raf);
			unsub();
		};
	}, [rootId, target]);
	useEffect(() => {
		const tick = () => {
			const el = target();
			const s = questManager.getState(rootId);
			if (el && s) setMarker(computeMarkerForTarget(el, s.width, s.height));
		};
		window.addEventListener("mousemove", tick);
		return () => window.removeEventListener("mousemove", tick);
	}, [target, rootId]);

	if (!marker) return null;

	if (marker.mode === "inline") {
		return (
			<div
				aria-label={label ?? "Quest target"}
				style={{
					top: 0,
					left: 0,
					position: "fixed",
					transform: `translate(${marker.x}px, ${marker.y}px) translate(-50%, -50%)`,
					pointerEvents: "none",
					zIndex: 9999,
				}}
			>
				<div
					style={{
						padding: "4px 8px",
						borderRadius: 8,
						background: "rgba(0,0,0,0.8)",
						color: "#fff",
						fontSize: 12,
					}}
				>
					{label ?? "●"}
				</div>
			</div>
		);
	}

	console.log(marker?.angle);

	return (
		<div
			aria-label={label ?? "Quest marker"}
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				transform: `translate(${marker.x}px, ${marker.y}px) translate(-50%, -50%) rotate(${marker.angle}rad)`,
				transformOrigin: "50% 50%",
				pointerEvents: "none",
				zIndex: 9999,
			}}
		>
			<ArrowGlyph />
		</div>
	);
}

function ArrowGlyph() {
	return (
		<div
			style={{
				width: 0,
				height: 0,
				borderTop: "8px solid transparent",
				borderBottom: "8px solid transparent",
				borderLeft: "14px solid black",
			}}
		/>
	);
}
