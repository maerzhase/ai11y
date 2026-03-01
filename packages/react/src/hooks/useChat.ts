import { useCallback, useRef, useState } from "react";

export interface Message {
	id: string;
	type: "user" | "assistant" | "system";
	content: string;
	timestamp: number;
}

export interface UseChatOptions {
	onSubmit: (
		message: string,
		messages: Message[],
	) => Promise<{ reply: string }>;
	onMessage?: () => void;
	initialMessage?: string;
}

export interface UseChatReturn {
	messages: Message[];
	input: string;
	setInput: (value: string) => void;
	isProcessing: boolean;
	handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export function useChat({
	onSubmit,
	onMessage,
	initialMessage = "Hi! I'm your AI agent. I can help you interact with this page.",
}: UseChatOptions): UseChatReturn {
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
	const processingRef = useRef(false);
	const messageIdCounterRef = useRef(0);
	const inputRef = useRef(input);
	const isProcessingRef = useRef(isProcessing);
	const messagesRef = useRef(messages);
	inputRef.current = input;
	isProcessingRef.current = isProcessing;
	messagesRef.current = messages;

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (
				!inputRef.current.trim() ||
				isProcessingRef.current ||
				processingRef.current
			)
				return;

			const userMessage = inputRef.current.trim();
			setInput("");
			setIsProcessing(true);
			processingRef.current = true;
			queueMicrotask(() => onMessage?.());

			messageIdCounterRef.current += 1;
			const userMsg: Message = {
				id: `user-${Date.now()}-${messageIdCounterRef.current}`,
				type: "user",
				content: userMessage,
				timestamp: Date.now(),
			};

			const updatedMessages = [...messagesRef.current, userMsg];
			setMessages(updatedMessages);
			queueMicrotask(() => onMessage?.());

			try {
				const response = await onSubmit(userMessage, updatedMessages);

				if (processingRef.current) {
					messageIdCounterRef.current += 1;
					const assistantMsg: Message = {
						id: `assistant-${Date.now()}-${messageIdCounterRef.current}`,
						type: "assistant",
						content: response.reply,
						timestamp: Date.now(),
					};
					setMessages((prevMsgs) => {
						const exists = prevMsgs.some(
							(msg) =>
								msg.id === assistantMsg.id ||
								(msg.type === "assistant" &&
									msg.content === response.reply &&
									msg.timestamp === assistantMsg.timestamp),
						);
						if (exists) return prevMsgs;
						return [...prevMsgs, assistantMsg];
					});
					queueMicrotask(() => onMessage?.());
				}
			} catch (error) {
				if (processingRef.current) {
					messageIdCounterRef.current += 1;
					const errorMsg: Message = {
						id: `error-${Date.now()}-${messageIdCounterRef.current}`,
						type: "assistant",
						content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
						timestamp: Date.now(),
					};
					setMessages((prevMsgs) => {
						const exists = prevMsgs.some(
							(msg) =>
								msg.id === errorMsg.id ||
								(msg.type === "assistant" &&
									msg.content === errorMsg.content &&
									msg.timestamp === errorMsg.timestamp),
						);
						if (exists) return prevMsgs;
						return [...prevMsgs, errorMsg];
					});
					queueMicrotask(() => onMessage?.());
				}
			} finally {
				setIsProcessing(false);
				processingRef.current = false;
			}
		},
		[onSubmit, onMessage],
	);

	return {
		messages,
		input,
		setInput,
		isProcessing,
		handleSubmit,
	};
}
