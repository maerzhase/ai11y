import * as React from "react";
import { DebugOffset } from "./DebugOffset";

export const isOffsetInPixels = (offset: any) =>
	typeof offset === "string" && offset.includes("px");

const createThreshold = (theta: number, height: number) => {
	const count = Math.ceil(height / theta);
	const t = [];
	const ratio = 1 / count;
	for (let i = 0; i <= count; i += 1) {
		t.push(i * ratio);
	}
	return t;
};

interface StoryProps {
	debug: boolean;
	children: React.ReactNode;
	offset: number;
	onStepEnter: () => void;
	onStepExit: () => void;
	onStepProgress: () => void;
	threshold: number;
}

export function Story(props: StoryProps) {
	const {
		debug,
		children,
		offset = 0.3,
		onStepEnter = () => {},
		onStepExit = () => {},
		onStepProgress = null,
		threshold = 4,
	} = props;
	const isOffsetDefinedInPixels = isOffsetInPixels(offset);
	const [lastScrollTop, setLastScrollTop] = React.useState(0);
	const [windowInnerHeight, setWindowInnerHeight] = React.useState<number>();

	const handleSetLastScrollTop = (scrollTop: number) => {
		setLastScrollTop(scrollTop);
	};

	const handleWindowResize = React.useCallback(() => {
		setWindowInnerHeight(window.innerHeight);
	}, []);

	React.useEffect(() => {
		if (isOffsetDefinedInPixels) {
			window.addEventListener("resize", handleWindowResize);
			return () => {
				window.removeEventListener("resize", handleWindowResize);
			};
		}
		return undefined;
	}, [isOffsetDefinedInPixels, handleWindowResize]);

	const isBrowser = typeof window !== "undefined";
	const innerHeight = isBrowser ? windowInnerHeight || window.innerHeight : 0;

	const offsetValue = isOffsetDefinedInPixels
		? +offset.replace("px", "") / innerHeight
		: offset;

	const progressThreshold = React.useMemo(
		() => createThreshold(threshold, innerHeight),
		[innerHeight],
	);

	return (
		<>
			{debug && <DebugOffset offset={offsetValue} />}
			{React.Children.map(children, (child, i) => {
				return React.cloneElement(child, {
					scrollamaId: `react-scrollama-${i}`,
					offset: offsetValue,
					onStepEnter,
					onStepExit,
					onStepProgress,
					lastScrollTop,
					handleSetLastScrollTop,
					progressThreshold,
					innerHeight,
				});
			})}
		</>
	);
}
