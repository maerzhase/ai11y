import { ScrollRoot, RootId } from "./_types";

export interface ScrollState {
  x: number;
  y: number;
  width: number;
  height: number;
  rectLeft: number;
  rectTop: number;
}

export interface QuestManager {
  addRoot(root: ScrollRoot, id?: RootId): RootId;
  removeRoot(id: RootId): void;

  getState(id: RootId): ScrollState | undefined;

  subscribe(id: RootId, fn: (state: ScrollState) => void): () => void;

  getRootIds(): RootId[];

  stop(): void;
}

