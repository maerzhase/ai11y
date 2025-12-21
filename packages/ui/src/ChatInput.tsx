import type React from "react";
import { Button } from "./Button";

export interface ChatInputProps {
	value: string;
	onChange: (value: string) => void;
	onSubmit: (e: React.FormEvent) => void;
	disabled?: boolean;
	placeholder?: string;
	inputRef?: React.RefObject<HTMLInputElement>;
}

export function ChatInput({
	value,
	onChange,
	onSubmit,
	disabled = false,
	placeholder = "Ask me anything...",
	inputRef,
}: ChatInputProps) {
	return (
		<form
			className="px-5 py-4 border-t border-border bg-muted"
			onSubmit={onSubmit}
		>
			<div className="flex gap-2">
				<input
					ref={inputRef}
					type="text"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
					disabled={disabled}
					className="flex-1 px-3.5 py-2.5 border border-input rounded-lg text-sm outline-none bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
				/>
				<Button
					type="submit"
					disabled={!value.trim() || disabled}
					className={`px-5 py-2.5 bg-primary text-primary-foreground border-none rounded-lg text-sm font-medium transition-opacity ${
						value.trim() && !disabled
							? "cursor-pointer opacity-100 hover:opacity-90"
							: "cursor-not-allowed opacity-50"
					}`}
				>
					Send
				</Button>
			</div>
		</form>
	);
}
