interface SuggestionChipProps {
	children: string;
	onClick: () => void;
}

export function SuggestionChip({ children, onClick }: SuggestionChipProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="inline-flex text-xs px-2 py-0.5 rounded-md border border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted hover:border-border hover:text-foreground active:scale-95 transition-all"
		>
			{children}
		</button>
	);
}
