import { Input as InputPrimitive } from "@base-ui/react/input";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "./lib/cn.js";

const inputContainerVariants = cva(
	"flex w-full items-center gap-3 rounded-xs bg-muted/50 px-2.5 font-normal text-base focus-within:bg-muted transition-colors",
	{
		variants: {
			size: {
				sm: "h-7 px-2",
				md: "h-8 px-2.5",
				lg: "h-9 px-3",
			},
			variant: {
				default: "",
				ghost: "bg-transparent hover:bg-muted/50 focus-within:bg-muted/50",
			},
		},
		defaultVariants: {
			size: "md",
			variant: "default",
		},
	}
);

export interface InputProps
	extends VariantProps<typeof inputContainerVariants>,
		Omit<React.ComponentProps<typeof InputPrimitive>, "size"> {
	inputClassName?: string;
	error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, inputClassName, size, variant, error, children, ...props }, ref) => {
		return (
			<div
				className={cn(
					inputContainerVariants({ size, variant }),
					error && "border border-destructive focus-within:border-destructive",
					className
				)}
			>
				<InputPrimitive
					spellCheck={false}
					className={cn(
						"h-full w-full bg-transparent focus:outline-none focus-visible:outline-none",
						error && "text-destructive",
						inputClassName
					)}
					{...props}
					ref={ref}
				/>
				{children}
			</div>
		);
	}
);

Input.displayName = "Input";

function InputSlot({
	className,
	side = "left",
	...props
}: React.HTMLAttributes<HTMLDivElement> & {
	side?: "left" | "right";
}) {
	return (
		<div
			className={cn(
				"px-1",
				{
					"-order-1": side === "left",
				},
				className
			)}
			{...props}
		/>
	);
}

InputSlot.displayName = "InputSlot";

export { InputSlot };
