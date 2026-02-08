export function Footer() {
	return (
		<footer
			id="site-footer"
			className="border-t border-border bg-muted/30 py-12 px-6"
		>
			<div className="max-w-6xl mx-auto text-center space-y-2">
				<p className="text-muted-foreground">
					Built with ai11y — A structured UI context layer for AI agents.
				</p>
				<a
					href="/docs/"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-block text-sm text-primary hover:underline"
				>
					API Docs
				</a>
			</div>
		</footer>
	);
}
