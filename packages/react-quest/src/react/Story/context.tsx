import React, {
	Children,
	cloneElement,
	createContext,
	isValidElement,
	type ReactElement,
	type RefAttributes,
	useCallback,
	useContext,
	useRef,
	useState,
} from "react";
import { useInView } from "react-intersection-observer";
import { createThreshold } from "./util";

type StoryContext = {
	debug: boolean;
	offset: number;
	innerHeight: number;
	setInnerHeight: (innerHeight: number) => void;
	scrollTop: number;
	setScrollTop: (scrollTop: number) => void;
	threshold: number[];
	activeChildIndex: number | null;
	setActiveChildIndex: (activeChild: number | null) => void;
};

const StoryContext = createContext<StoryContext>({
	debug: false,
	offset: 0,
	innerHeight: 0,
	setInnerHeight: () => {},
	scrollTop: 0,
	setScrollTop: () => {},
	threshold: [],
	activeChildIndex: null,
	setActiveChildIndex: () => {},
});

export interface StoryChildProps {
	storyIndex: number;
}

export interface StoryProviderProps {
	debug: boolean;
	offset: number;
	threshold?: number;
	children: ReactElement<StoryChildProps> | ReactElement<StoryChildProps>[];
}

export function StoryProvider({
	debug,
	offset,
	threshold = 4,
	children,
}: StoryProviderProps) {
	const [innerHeight, setInnerHeight] = useState(0);
	const [scrollTop, setScrollTop] = useState(0);
	const [activeChildIndex, setActiveChildIndex] = useState<number | null>(null);

	const progressThreshold = React.useMemo(
		() => createThreshold(threshold, innerHeight),
		[innerHeight, threshold],
	);

	return (
		<StoryContext.Provider
			value={{
				debug,
				offset,
				innerHeight,
				setInnerHeight,
				scrollTop,
				setScrollTop,
				threshold: progressThreshold,
				activeChildIndex,
				setActiveChildIndex,
			}}
		>
			{Children.map(children, (child, idx) => {
				return cloneElement(child, {
					storyIndex: idx,
				});
			})}
		</StoryContext.Provider>
	);
}

type StoryStepProps = {
	children: ReactElement;
};

export function StoryStep<T extends Element = HTMLElement>({
	children,
}: StoryStepProps) {
	const storyContext = useContext(StoryContext);
	const ref = useRef<T>(null);

	const { ref: inViewRef, entry } = useInView({
		rootMargin: "0px",
		threshold: 0,
	});

	const { ref: scrollProgressRef, entry: scrollProgressEntry } = useInView({
		rootMargin: "0px",
		threshold: storyContext.threshold,
	});

	const setRefs = useCallback(
		(node: T) => {
			ref.current = node;
			inViewRef(node);
			scrollProgressRef(node);
		},
		[inViewRef, scrollProgressRef],
	);

	if (!isValidElement<RefAttributes<T>>(children)) {
		throw new Error("StoryStep expects a single element child.");
	}

	return cloneElement(children, { ref: setRefs });
}
