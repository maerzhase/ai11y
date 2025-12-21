import { useCallback, useEffect, useRef, useState } from "react";
import type { AgentResponse, ToolCall } from "./types";

export interface Message {
	id: string;
	type: "user" | "assistant" | "system";
	content: string;
	timestamp: number;
}

export interface UseAssistChatOptions {
	onSubmit: (message: string, messages: Message[]) => Promise<AgentResponse>;
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
	const processingRef = useRef(false);

	// Auto-scroll to bottom when messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (!input.trim() || isProcessing || processingRef.current) return;

			const userMessage = input.trim();
			setInput("");
			setIsProcessing(true);
			processingRef.current = true;

			// Add user message
			const userMsg: Message = {
				id: `user-${Date.now()}`,
				type: "user",
				content: userMessage,
				timestamp: Date.now(),
			};
			
			// Build updated messages array for conversation history
			setMessages((prev) => {
				const updated = [...prev, userMsg];
				
				// Pass conversation history (including the new user message) to onSubmit
				onSubmit(userMessage, updated)
					.then((response) => {
						// Add assistant reply only if we're still processing (prevent duplicates)
						if (processingRef.current) {
							const assistantMsg: Message = {
								id: `assistant-${Date.now()}`,
								type: "assistant",
								content: response.reply,
								timestamp: Date.now(),
							};
							setMessages((prevMsgs) => [...prevMsgs, assistantMsg]);

							// Execute tool calls
							if (response.toolCalls && onToolCall) {
								for (const toolCall of response.toolCalls) {
									onToolCall(toolCall);
								}
							}
						}
					})
					.catch((error) => {
						// Handle errors gracefully
						if (processingRef.current) {
							const errorMsg: Message = {
								id: `error-${Date.now()}`,
								type: "assistant",
								content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
								timestamp: Date.now(),
							};
							setMessages((prevMsgs) => [...prevMsgs, errorMsg]);
						}
					})
					.finally(() => {
						setIsProcessing(false);
						processingRef.current = false;
					});
				
				return updated;
			});
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
