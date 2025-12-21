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
						? "bg-blue-500 text-white"
						: message.type === "system"
							? "bg-gray-100 text-gray-500 border border-gray-200"
							: "bg-gray-50 text-gray-900"
				}`}
			>
				{message.content}
			</div>
		</div>
	);
}
