import { ComponentRef, ElementType } from "react";

export const createThreshold = (theta: number, height: number) => {
	const count = Math.ceil(height / theta);
	const t = [];
	const ratio = 1 / count;
	for (let i = 0; i <= count; i += 1) {
		t.push(i * ratio);
	}
	return t;
};

export const useRootMargin = (offset: number) => {
	return `-${offset * 100}% 0px -${100 - offset * 100}% 0px`;
};

type ScrollDirection = "up" | "down";

export function useProgressRootMargin<E extends HTMLElement>(
	direction: ScrollDirection,
	offset: number,
	node: React.RefObject<E>,
	innerHeight: number,
): string {
	const el = node.current;
	if (!el || innerHeight === 0) return "0px";

	const ratio = el.offsetHeight / innerHeight;

	if (direction === "down") {
		const top = (ratio - offset) * 100;
		const bottom = offset * 100 - 100;
		return `${top}% 0px ${bottom}% 0px`;
	}

	const top = -offset * 100;
	const bottom = ratio * 100 - (100 - offset * 100);
	return `${top}% 0px ${bottom}% 0px`;
}
