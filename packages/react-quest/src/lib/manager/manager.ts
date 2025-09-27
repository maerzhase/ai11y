import { isWindow } from "../util/isWindow";
import type { QuestManager, ScrollState } from "./_interfaces";
import type { RootId, ScrollRoot } from "./_types";

function createQuestManager(): QuestManager {
	const roots = new Map<
		RootId,
		{
			root: ScrollRoot;
			state: ScrollState | undefined;
			subs: Set<(s: ScrollState) => void>;
			scheduled: boolean;
			dispose: () => void;
		}
	>();

	let autoInc = 0;

	const readState = (root: ScrollRoot): ScrollState => {
		if (isWindow(root)) {
			const x = root.scrollX || 0;
			const y = root.scrollY || 0;
			const width = root.innerWidth;
			const height = root.innerHeight;
			return {
				x,
				y,
				width,
				height,
				rectLeft: 0,
				rectTop: 0,
			};
		} else {
			const x = root.scrollLeft;
			const y = root.scrollTop;
			const rect = root.getBoundingClientRect();
			const width = rect.width;
			const height = rect.height;
			return {
				x,
				y,
				width,
				height,
				rectLeft: rect.left,
				rectTop: rect.top,
			};
		}
	};

	const equalState = (a?: ScrollState, b?: ScrollState) => {
		if (!a || !b) return false;
		return (
			a.x === b.x &&
			a.y === b.y &&
			a.width === b.width &&
			a.height === b.height &&
			a.rectLeft === b.rectLeft &&
			a.rectTop === b.rectTop
		);
	};

	const scheduleRead = (id: RootId) => {
		const entry = roots.get(id);
		if (!entry || entry.scheduled) return;
		entry.scheduled = true;

		requestAnimationFrame(() => {
			entry.scheduled = false;
			const next = readState(entry.root);
			if (!equalState(entry.state, next)) {
				entry.state = next;
				entry.subs.forEach((fn) => fn(next));
			}
		});
	};

	const setupListeners = (id: RootId, root: ScrollRoot) => {
		const onScroll = () => scheduleRead(id);
		const onResize = () => scheduleRead(id);

		if (isWindow(root)) {
			root.addEventListener("scroll", onScroll, { passive: true });
			root.addEventListener("resize", onResize, { passive: true });
		} else {
			root.addEventListener("scroll", onScroll, { passive: true });
		}

		let ro: ResizeObserver | undefined;
		if (!isWindow(root) && typeof ResizeObserver !== "undefined") {
			ro = new ResizeObserver(() => scheduleRead(id));
			ro.observe(root as HTMLElement);
		} else if (isWindow(root)) {
		}

		scheduleRead(id);

		return () => {
			if (isWindow(root)) {
				root.removeEventListener("scroll", onScroll);
				root.removeEventListener("resize", onResize);
			} else {
				root.removeEventListener("scroll", onScroll);
				ro?.disconnect();
			}
		};
	};

	const addRoot = (root: ScrollRoot, id?: RootId): RootId => {
		const rid = id ?? `root-${++autoInc}`;
		if (roots.has(rid)) {
			throw new Error(`[questManager] root id "${rid}" already exists`);
		}
		const subs = new Set<(s: ScrollState) => void>();
		const dispose = setupListeners(rid, root);
		roots.set(rid, {
			root,
			subs,
			state: undefined,
			scheduled: false,
			dispose,
		});
		return rid;
	};

	const removeRoot = (id: RootId) => {
		const entry = roots.get(id);
		if (!entry) return;
		entry.dispose();
		roots.delete(id);
	};

	const getState = (id: RootId): ScrollState | undefined => {
		return roots.get(id)?.state;
	};

	const subscribe = (id: RootId, fn: (state: ScrollState) => void) => {
		const entry = roots.get(id);
		if (!entry) {
			throw new Error(`[questManager] unknown root id "${id}"`);
		}
		entry.subs.add(fn);
		if (entry.state) fn(entry.state);
		return () => entry.subs.delete(fn);
	};

	const getRootIds = () => Array.from(roots.keys());

	const stop = () => {
		roots.forEach((e) => e.dispose());
		// keep state/subscribers but no listeners;
		// useful if you want to re-enable later by re-adding roots
	};

	return {
		addRoot,
		removeRoot,
		getState,
		subscribe,
		getRootIds,
		stop,
	};
}

export const questManager = createQuestManager();
