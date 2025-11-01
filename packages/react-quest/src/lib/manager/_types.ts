export type ScrollRoot = Window | HTMLElement;
export type RootId = string;
export type QuestStep = {
	id: string;
	getTarget: () => HTMLElement | null;
	label?: string;
	when?: () => boolean;
	onEnter?: () => void;
	onExit?: () => void;
};

export type QuestSnapshot = {
	index: number;
	step: QuestStep | null;
	done: boolean;
};

export type Quest = {
	current: () => QuestSnapshot;
	next: () => QuestSnapshot;
	prev: () => QuestSnapshot;
	goto: (id: string) => QuestSnapshot;
	reset: () => QuestSnapshot;
	subscribe: (fn: (s: QuestSnapshot) => void) => () => void;
};
