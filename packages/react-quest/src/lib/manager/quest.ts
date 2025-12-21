import type { Quest, QuestSnapshot, QuestStep } from "./_types";

export function createQuest(steps: QuestStep[]): Quest {
	let i = -1;
	let done = false;
	const subs = new Set<(s: QuestSnapshot) => void>();

	const enterIndex = (idx: number) => {
		if (idx === i) return;
		const prev = steps[i];
		prev?.onExit?.();
		i = idx;
		const cur = steps[i];
		cur?.onEnter?.();
		emit();
	};

	const findNextIdx = (start: number) => {
		for (let k = start + 1; k < steps.length; k++) {
			const s = steps[k];
			if (!s.when || s.when()) return k;
		}
		return steps.length;
	};

	const findPrevIdx = (start: number) => {
		for (let k = start - 1; k >= 0; k--) {
			const s = steps[k];
			if (!s.when || s.when()) return k;
		}
		return -1;
	};

	const snap = (): QuestSnapshot => ({
		index: i,
		step: i >= 0 && i < steps.length ? steps[i] : null,
		done,
	});

	const emit = () => {
		const s = snap();
		subs.forEach((fn) => {
			fn(s);
		});
	};

	const api: Quest = {
		current: () => snap(),
		next: () => {
			const n = findNextIdx(i);
			if (n >= steps.length) {
				done = true;
				emit();
				return snap();
			}
			done = false;
			enterIndex(n);
			return snap();
		},
		prev: () => {
			const p = findPrevIdx(i);
			if (p < 0) {
				enterIndex(-1);
				return snap();
			}
			done = false;
			enterIndex(p);
			return snap();
		},
		goto: (id: string) => {
			const idx = steps.findIndex((s) => s.id === id && (!s.when || s.when()));
			if (idx === -1) return snap();
			done = false;
			enterIndex(idx);
			return snap();
		},
		reset: () => {
			done = false;
			enterIndex(-1);
			return snap();
		},
		subscribe: (fn) => {
			subs.add(fn);
			fn(snap());
			return () => subs.delete(fn);
		},
	};

	api.next();
	return api;
}
