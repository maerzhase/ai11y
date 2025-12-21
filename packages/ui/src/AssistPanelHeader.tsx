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
		<div className="px-5 py-4 border-b border-border flex justify-between items-center bg-muted">
			<h3 className="m-0 text-lg font-semibold text-foreground">{title}</h3>
			<Button
				onClick={onClose}
				className="bg-transparent border-none cursor-pointer text-xl text-muted-foreground p-1 hover:text-foreground transition-colors"
				aria-label="Close"
			>
				×
			</Button>
		</div>
	);
}
