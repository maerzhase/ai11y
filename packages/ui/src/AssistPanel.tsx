import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { Button } from "./Button";

export interface Message {
	id: string;
	type: "user" | "assistant" | "system";
	content: string;
	timestamp: number;
}

export interface ToolCall {
	type: "navigate" | "highlight" | "click";
	route?: string;
	markerId?: string;
}

export interface AssistPanelProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (message: string) => Promise<{
		reply: string;
		toolCalls?: ToolCall[];
	}>;
	onToolCall?: (toolCall: ToolCall) => void;
	initialMessage?: string;
}

export function AssistPanel({
	isOpen,
	onOpenChange,
	onSubmit,
	onToolCall,
	initialMessage = "Hi! I'm your AI assistant. I can help you navigate, click buttons, and highlight elements. Try saying 'go to billing' or 'click connect stripe'.",
}: AssistPanelProps) {
	const [messages, setMessages] = useState<Message[]>([
		{
			id: "welcome",
			type: "assistant",
			content: initialMessage,
			timestamp: Date.now(),
		},
	]);
	const [input, setInput] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Auto-scroll to bottom when messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// Focus input when panel opens
	useEffect(() => {
		if (isOpen && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isOpen]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isProcessing) return;

		const userMessage = input.trim();
		setInput("");
		setIsProcessing(true);

		// Add user message
		const userMsg: Message = {
			id: `user-${Date.now()}`,
			type: "user",
			content: userMessage,
			timestamp: Date.now(),
		};
		setMessages((prev) => [...prev, userMsg]);

		try {
			const response = await onSubmit(userMessage);

			// Add assistant reply
			const assistantMsg: Message = {
				id: `assistant-${Date.now()}`,
				type: "assistant",
				content: response.reply,
				timestamp: Date.now(),
			};
			setMessages((prev) => [...prev, assistantMsg]);

			// Execute tool calls
			if (response.toolCalls && onToolCall) {
				for (const toolCall of response.toolCalls) {
					onToolCall(toolCall);
				}
			}
		} catch (error) {
			// Handle errors gracefully
			const errorMsg: Message = {
				id: `error-${Date.now()}`,
				type: "assistant",
				content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
				timestamp: Date.now(),
			};
			setMessages((prev) => [...prev, errorMsg]);
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<Popover.Root open={isOpen} onOpenChange={onOpenChange}>
			<Popover.Trigger
				className="fixed bottom-5 right-5 flex size-14 items-center justify-center rounded-full bg-blue-500 text-white border-none select-none hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-blue-600 data-[popup-open]:bg-blue-600 shadow-lg text-2xl z-[10000] transition-colors"
				aria-label="Open AI Assistant"
			>
				💬
			</Popover.Trigger>

			<Popover.Portal>
				<Popover.Positioner placement="top-end" sideOffset={8}>
					<Popover.Popup className="origin-[var(--transform-origin)] w-[400px] h-[600px] max-h-[calc(100vh-40px)] rounded-lg bg-white text-gray-900 shadow-lg shadow-gray-200 outline outline-1 outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 flex flex-col z-[10000] overflow-hidden">
						{/* Header */}
						<div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
							<h3 className="m-0 text-lg font-semibold">AI Assistant</h3>
							<Button
								onClick={() => onOpenChange(false)}
								className="bg-transparent border-none cursor-pointer text-xl text-gray-500 p-1 hover:text-gray-700 transition-colors"
								aria-label="Close"
							>
								×
							</Button>
						</div>

						{/* Messages */}
						<div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
							{messages.map((msg) => (
								<div
									key={msg.id}
									className={`flex flex-col ${
										msg.type === "user" ? "items-end" : "items-start"
									}`}
								>
									<div
										className={`px-3.5 py-2.5 rounded-xl max-w-[80%] text-sm leading-relaxed ${
											msg.type === "user"
												? "bg-blue-500 text-white"
												: msg.type === "system"
													? "bg-gray-100 text-gray-500 border border-gray-200"
													: "bg-gray-50 text-gray-900"
										}`}
									>
										{msg.content}
									</div>
								</div>
							))}
							{isProcessing && (
								<div className="px-3.5 py-2.5 rounded-xl bg-gray-50 text-gray-500 text-sm">
									Thinking...
								</div>
							)}
							<div ref={messagesEndRef} />
						</div>

						{/* Input */}
						<form
							className="px-5 py-4 border-t border-gray-200 bg-gray-50"
							onSubmit={handleSubmit}
						>
							<div className="flex gap-2">
								<input
									ref={inputRef}
									type="text"
									value={input}
									onChange={(e) => setInput(e.target.value)}
									placeholder="Ask me anything..."
									disabled={isProcessing}
									className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
								/>
								<Button
									type="submit"
									disabled={!input.trim() || isProcessing}
									className={`px-5 py-2.5 bg-blue-500 text-white border-none rounded-lg text-sm font-medium transition-opacity ${
										input.trim() && !isProcessing
											? "cursor-pointer opacity-100 hover:bg-blue-600"
											: "cursor-not-allowed opacity-50"
									}`}
								>
									Send
								</Button>
							</div>
						</form>
					</Popover.Popup>
				</Popover.Positioner>
			</Popover.Portal>
		</Popover.Root>
	);
}
