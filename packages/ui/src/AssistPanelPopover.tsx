import { Popover } from "@base-ui/react/popover";
import type React from "react";

export interface AssistPanelPopoverProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	children: React.ReactNode;
	trigger?: React.ReactNode;
	triggerClassName?: string;
}

export function AssistPanelPopover({
	isOpen,
	onOpenChange,
	children,
	trigger,
	triggerClassName = "fixed bottom-5 right-5 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground border-none select-none hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-ring active:opacity-90 data-[popup-open]:opacity-90 shadow-lg text-2xl z-[10000] transition-opacity",
}: AssistPanelPopoverProps) {
	return (
		<Popover.Root open={isOpen} onOpenChange={onOpenChange}>
			<Popover.Trigger
				className={triggerClassName}
				aria-label="Open AI Assistant"
			>
				{trigger ?? "💬"}
			</Popover.Trigger>

			<Popover.Portal className="z-200">
				<Popover.Positioner
					placement="top-end"
					sideOffset={8}
					className="z-200"
				>
					<Popover.Popup className="origin-[var(--transform-origin)] w-[400px] h-[600px] max-h-[calc(100vh-40px)] rounded-lg bg-popover text-popover-foreground outline outline-1 outline-border transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 flex flex-col z-200 overflow-hidden">
						{children}
					</Popover.Popup>
				</Popover.Positioner>
			</Popover.Portal>
		</Popover.Root>
	);
}
