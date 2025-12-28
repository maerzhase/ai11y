import { MorphingBlob } from "@quest/ui";

interface LogoCircularProps {
	className?: string;
}

export function LogoCircular({ className }: LogoCircularProps) {
	return (
		<MorphingBlob size={28} className={`text-foreground ${className ?? ""}`}>
			<svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				className="text-background"
			>
				{/* Face - eyes */}
				<circle cx="8" cy="10" r="2" fill="currentColor" />
				<circle cx="16" cy="10" r="2" fill="currentColor" />
				{/* Smile */}
				<path
					d="M8 15c1.5 2 6.5 2 8 0"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
				/>
			</svg>
		</MorphingBlob>
	);
}
