import { useCallback, useEffect, useRef, useState } from "react";
import type { AgentResponse, ToolCall } from "./types";

export interface Message {
	id: string;
	type: "user" | "assistant" | "system";
	content: string;
	timestamp: number;
}

export interface UseAssistChatOptions {
	onSubmit: (message: string) => Promise<AgentResponse>;
	onToolCall?: (toolCall: ToolCall) => void;
	initialMessage?: string;
}

export interface UseAssistChatReturn {
	messages: Message[];
	input: string;
	setInput: (value: string) => void;
	isProcessing: boolean;
	messagesEndRef: React.RefObject<HTMLDivElement>;
	inputRef: React.RefObject<HTMLInputElement>;
	handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export function useAssistChat({
	onSubmit,
	onToolCall,
	initialMessage = "Hi! I'm your AI assistant. I can help you navigate, click buttons, and highlight elements. Try saying 'go to billing' or 'click connect stripe'.",
}: UseAssistChatOptions): UseAssistChatReturn {
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
	}, []);

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
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
		},
		[input, isProcessing, onSubmit, onToolCall],
	);

	return {
		messages,
		input,
		setInput,
		isProcessing,
		messagesEndRef,
		inputRef,
		handleSubmit,
	};
}
