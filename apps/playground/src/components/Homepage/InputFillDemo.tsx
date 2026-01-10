import { Mark } from "@ui4ai/react";
import { Field, Form, Input, Textarea } from "@ui4ai/ui";
import { useState } from "react";
import { SuggestionChip } from "../SuggestionChip";

export function InputFillDemoWithSuggestions({
	onSuggestion,
}: {
	onSuggestion: (s: string) => void;
}) {
	const [email, setEmail] = useState("");
	const [name, setName] = useState("");
	const [message, setMessage] = useState("");

	return (
		<div className="space-y-4">
			<div className="text-sm text-muted-foreground mb-3">
				The agent can fill input fields with values:
			</div>
			<Form>
				<Mark
					id="fill_demo_email"
					label="Email Input"
					intent="Email address input field"
				>
					<Field label="Email Address" name="email">
						<Input
							type="email"
							id="fill_demo_email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Enter your email"
							className="w-full"
							data-1p-ignore="true"
							autoComplete="off"
						/>
						{email && (
							<div className="text-xs text-muted-foreground">
								Current value: {email}
							</div>
						)}
					</Field>
				</Mark>

				<Mark
					id="fill_demo_name"
					label="Name Input"
					intent="Full name input field"
				>
					<Field label="Full Name" name="name">
						<Input
							type="text"
							id="fill_demo_name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Enter your name"
							className="w-full"
							data-1p-ignore="true"
							autoComplete="off"
						/>
						{name && (
							<div className="text-xs text-muted-foreground">
								Current value: {name}
							</div>
						)}
					</Field>
				</Mark>

				<Mark
					id="fill_demo_message"
					label="Message Textarea"
					intent="Message textarea field"
				>
					<Field label="Message" name="message">
						<Textarea
							id="fill_demo_message"
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							placeholder="Enter your message"
							rows={3}
							className="w-full"
							data-1p-ignore="true"
							autoComplete="off"
						/>
						{message && (
							<div className="text-xs text-muted-foreground">
								Current value: {message.substring(0, 50)}
								{message.length > 50 ? "..." : ""}
							</div>
						)}
					</Field>
				</Mark>
			</Form>
			<p className="text-xs text-muted-foreground pt-2">
				Try{" "}
				<SuggestionChip
					onClick={() => onSuggestion("fill email with test@example.com")}
				>
					fill email with test@example.com
				</SuggestionChip>
				,{" "}
				<SuggestionChip onClick={() => onSuggestion("fill name with John Doe")}>
					fill name with John Doe
				</SuggestionChip>{" "}
				or{" "}
				<SuggestionChip
					onClick={() =>
						onSuggestion("fill message with Hello, this is a test message!")
					}
				>
					fill message with Hello, this is a test message!
				</SuggestionChip>
			</p>
		</div>
	);
}
