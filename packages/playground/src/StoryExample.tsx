import React, { useState } from "react";
import { Story, Step } from "react-quest";

export const StoryExample = () => {
	const [currentStepIndex, setCurrentStepIndex] = useState(null);
	const [progress, setProgres] = useState(0);

	// This callback fires when a Step hits the offset threshold. It receives the
	// data prop of the step, which in this demo stores the index of the step.
	const onStepEnter = ({ data }) => {
		setCurrentStepIndex(data);
	};

	return (
		<>
			<div style={{ position: "sticky", top: 0, border: "1px solid orchid" }}>
				I'm sticky. The current triggered step index is: {currentStepIndex}{" "}
				{progress}
			</div>
			<div style={{ margin: "50vh 0", border: "2px dashed skyblue" }}>
				<Story
					offset={0.5}
					onStepEnter={onStepEnter}
					onStepProgress={({ progress }) => setProgres(progress)}
					debug
				>
					{[1, 2, 3, 4].map((_, stepIndex) => (
						<Step data={stepIndex} key={stepIndex}>
							<div
								style={{
									height: "50vh",
									border: "1px solid gray",
									opacity: currentStepIndex === stepIndex ? 1 : 0.2,
								}}
							>
								I'm a Step Step of index {stepIndex}
							</div>
						</Step>
					))}
				</Story>
			</div>
		</>
	);
};
