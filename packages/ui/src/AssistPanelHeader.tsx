import { Button } from "./Button";

export interface AssistPanelHeaderProps {
	title?: string;
	onClose: () => void;
}

export function AssistPanelHeader({
	title = "AI Assistant",
	onClose,
}: AssistPanelHeaderProps) {
	return (
		<div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
			<h3 className="m-0 text-lg font-semibold">{title}</h3>
			<Button
				onClick={onClose}
				className="bg-transparent border-none cursor-pointer text-xl text-gray-500 p-1 hover:text-gray-700 transition-colors"
				aria-label="Close"
			>
				×
			</Button>
		</div>
	);
}
