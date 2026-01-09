import { useCallback, useEffect, useRef, useState } from "react";
import type { AgentResponse, ToolCall } from "./types.js";

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
	initialMessage = "Hi! I'm your AI agent. I can help you navigate, click buttons, and highlight elements. Try saying 'go to billing' or 'click connect stripe'.",
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
	const messageIdCounterRef = useRef(0);

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
			messageIdCounterRef.current += 1;
			const userMsg: Message = {
				id: `user-${Date.now()}-${messageIdCounterRef.current}`,
				type: "user",
				content: userMessage,
				timestamp: Date.now(),
			};

			// Build updated messages array for conversation history
			let updatedMessages: Message[] = [];
			setMessages((prev) => {
				updatedMessages = [...prev, userMsg];
				return updatedMessages;
			});

			try {
				// Call onSubmit with the updated messages (outside of state setter)
				const response = await onSubmit(userMessage, updatedMessages);

				// Add agent reply only if we're still processing (prevent duplicates)
				if (processingRef.current) {
					messageIdCounterRef.current += 1;
					const assistantMsg: Message = {
						id: `assistant-${Date.now()}-${messageIdCounterRef.current}`,
						type: "assistant",
						content: response.reply,
						timestamp: Date.now(),
					};
					setMessages((prevMsgs) => {
						// Check if this exact message already exists to prevent duplicates
						const exists = prevMsgs.some(
							(msg) => msg.id === assistantMsg.id || (msg.type === "assistant" && msg.content === response.reply && msg.timestamp === assistantMsg.timestamp),
						);
						if (exists) return prevMsgs;
						return [...prevMsgs, assistantMsg];
					});

					// Execute tool calls
					if (response.toolCalls && onToolCall) {
						for (const toolCall of response.toolCalls) {
							onToolCall(toolCall);
						}
					}
				}
			} catch (error) {
				// Handle errors gracefully
				if (processingRef.current) {
					messageIdCounterRef.current += 1;
					const errorMsg: Message = {
						id: `error-${Date.now()}-${messageIdCounterRef.current}`,
						type: "assistant",
						content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
						timestamp: Date.now(),
					};
					setMessages((prevMsgs) => {
						// Check for duplicates
						const exists = prevMsgs.some(
							(msg) => msg.id === errorMsg.id || (msg.type === "assistant" && msg.content === errorMsg.content && msg.timestamp === errorMsg.timestamp),
						);
						if (exists) return prevMsgs;
						return [...prevMsgs, errorMsg];
					});
				}
			} finally {
				setIsProcessing(false);
				processingRef.current = false;
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
