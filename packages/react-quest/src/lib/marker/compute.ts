export type Marker =
	| {
			mode: "edge";
			x: number;
			y: number;
			angle: number; // radians
			edge: "top" | "right" | "bottom" | "left";
	  }
	| { mode: "inline"; x: number; y: number; angle: number }; // angle is irrelevant here

export function computeMarkerForTarget(
	el: HTMLElement,
	viewportW: number,
	viewportH: number,
	inset = 12,
): Marker | null {
	const r = el.getBoundingClientRect();
	const tx = r.left + r.width / 2; // target cx
	const ty = r.top + r.height / 2; // target cy

	const left = inset;
	const right = viewportW - inset;
	const top = inset;
	const bottom = viewportH - inset;

	// If the target is visible, pin inline (angle is irrelevant here)
	const inView =
		r.right > 0 && r.left < viewportW && r.bottom > 0 && r.top < viewportH;
	if (inView) {
		return {
			mode: "inline",
			x: clamp(tx, left, right),
			y: clamp(ty, top, bottom),
			angle: 0,
		};
	}

	// Ray from viewport center to target center
	const vx = viewportW / 2;
	const vy = viewportH / 2;
	const dx = tx - vx;
	const dy = ty - vy;

	console.log(tx, ty);

	// Angle the marker should face (radians), 0 = right, CCW positive
	const angle = Math.atan2(dy, dx);

	// Intersect the ray (vx, vy) + t*(dx, dy), t >= 0, with the inset rectangle.
	// Compute t for each boundary where the ray could hit, then pick the smallest t >= 0.
	const candidates: { t: number; edge: "left" | "right" | "top" | "bottom" }[] =
		[];

	if (dx !== 0) {
		const tLeft = (left - vx) / dx;
		const yAtLeft = vy + tLeft * dy;
		if (tLeft >= 0 && yAtLeft >= top && yAtLeft <= bottom)
			candidates.push({ t: tLeft, edge: "left" });

		const tRight = (right - vx) / dx;
		const yAtRight = vy + tRight * dy;
		if (tRight >= 0 && yAtRight >= top && yAtRight <= bottom)
			candidates.push({ t: tRight, edge: "right" });
	}
	if (dy !== 0) {
		const tTop = (top - vy) / dy;
		const xAtTop = vx + tTop * dx;
		if (tTop >= 0 && xAtTop >= left && xAtTop <= right)
			candidates.push({ t: tTop, edge: "top" });

		const tBottom = (bottom - vy) / dy;
		const xAtBottom = vx + tBottom * dx;
		if (tBottom >= 0 && xAtBottom >= left && xAtBottom <= right)
			candidates.push({ t: tBottom, edge: "bottom" });
	}

	if (candidates.length === 0) return null; // degenerate, shouldn't happen unless dx=dy=0 and offscreen

	candidates.sort((a, b) => a.t - b.t);
	const hit = candidates[0];
	const ex = vx + hit.t * dx;
	const ey = vy + hit.t * dy;

	// Normalize edge naming to your type
	const edge =
		hit.edge === "top"
			? "top"
			: hit.edge === "bottom"
				? "bottom"
				: hit.edge === "left"
					? "left"
					: "right";
	console.log("ANGLE", angle);
	return { mode: "edge", x: ex, y: ey, angle, edge };
}

function clamp(n: number, a: number, b: number) {
	return Math.max(a, Math.min(b, n));
}
