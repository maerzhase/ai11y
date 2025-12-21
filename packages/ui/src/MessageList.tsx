import type React from "react";
import { MessageBubble } from "./MessageBubble";

export interface Message {
	type: "user" | "assistant" | "system";
	content: string;
	id?: string;
}

export interface MessageListProps {
	messages: Message[];
	isProcessing?: boolean;
	messagesEndRef?: React.RefObject<HTMLDivElement>;
}

export function MessageList({
	messages,
	isProcessing = false,
	messagesEndRef,
}: MessageListProps) {
	return (
		<div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
			{messages.map((msg, index) => (
				<MessageBubble key={msg.id ?? `msg-${index}`} message={msg} />
			))}
			{isProcessing && (
				<div className="px-3.5 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm">
					Thinking...
				</div>
			)}
			<div ref={messagesEndRef} />
		</div>
	);
}
