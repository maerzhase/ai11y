import { Popover } from "@base-ui/react/popover";
import type React from "react";

export interface AssistPanelPopoverProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onClose?: () => void;
	children: React.ReactNode;
	trigger?: React.ReactNode;
	triggerClassName?: string;
}

export function AssistPanelPopover({
	isOpen,
	onOpenChange,
	onClose,
	children,
	trigger,
	triggerClassName = "fixed bottom-4 right-4 flex size-10 items-center justify-center rounded-full bg-foreground/90 text-background border-none select-none hover:bg-foreground focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-ring active:scale-95 data-[popup-open]:bg-foreground shadow-sm text-base z-[10000] transition-all duration-150",
}: AssistPanelPopoverProps) {
	return (
		<Popover.Root open={isOpen} onOpenChange={onOpenChange}>
			<Popover.Trigger
				className={triggerClassName}
				aria-label="Open AI Assistant"
			>
				{trigger ?? (
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
					</svg>
				)}
			</Popover.Trigger>

			<Popover.Portal className="z-200">
				<Popover.Positioner
					side="top"
					align="end"
					sideOffset={8}
					className="z-200"
				>
					<Popover.Popup className="relative origin-[var(--transform-origin)] w-[320px] h-[420px] max-h-[calc(100vh-80px)] rounded-xl bg-popover/70 backdrop-blur-2xl backdrop-saturate-150 text-popover-foreground shadow-xl shadow-black/10 border border-white/10 transition-[transform,scale,opacity] duration-200 ease-out data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 flex flex-col z-200 overflow-hidden">
						{onClose && (
							<button
								type="button"
								onClick={onClose}
								className="absolute top-2 right-2 z-10 p-1 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted/50"
								aria-label="Close"
							>
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							</button>
						)}
						{children}
					</Popover.Popup>
				</Popover.Positioner>
			</Popover.Portal>
		</Popover.Root>
	);
}
