export interface MessageBubbleProps {
	message: {
		type: "user" | "assistant" | "system";
		content: string;
	};
}

export function MessageBubble({ message }: MessageBubbleProps) {
	return (
		<div
			className={`flex flex-col ${
				message.type === "user" ? "items-end" : "items-start"
			}`}
		>
			<div
				className={`px-3.5 py-2.5 rounded-xl max-w-[80%] text-sm leading-relaxed ${
					message.type === "user"
						? "bg-primary text-primary-foreground"
						: message.type === "system"
							? "bg-muted text-muted-foreground border border-border"
							: "bg-muted text-foreground"
				}`}
			>
				{message.content}
			</div>
		</div>
	);
}
