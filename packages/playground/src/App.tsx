"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
	questManager,
	Quest,
	createQuest,
	QuestSnapshot,
	QuestMarker,
} from "react-quest";

export default function App() {
	const step1Ref = useRef<HTMLDivElement>(null);
	const step2Ref = useRef<HTMLDivElement>(null);
	const step3Ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		try {
			questManager.addRoot(window, "window");
		} catch {}
	}, []);

	const quest: Quest = useMemo(
		() =>
			createQuest([
				{ id: "profile", label: "Profile", getTarget: () => step1Ref.current },
				{
					id: "settings",
					label: "Settings",
					getTarget: () => step2Ref.current,
				},
				{ id: "save", label: "Save", getTarget: () => step3Ref.current },
			]),
		[],
	);

	const [snap, setSnap] = useState<QuestSnapshot>(quest.current());
	useEffect(() => quest.subscribe(setSnap), [quest]);

	const currentTarget = () => snap.step?.getTarget() ?? null;

	return (
		<div style={{ minHeight: "300vh", padding: 24 }}>
			<h1>React Quest — Marker MVP</h1>
			<p>
				Scroll; when a step is off-screen, an arrow appears on the edge pointing
				to it. When it’s visible, the badge sits on the target.
			</p>

			<section style={{ marginTop: "40vh" }}>
				<h2>
					<span ref={step1Ref}>Profile</span>
				</h2>
				<p>Imagine your profile card here.</p>
			</section>

			<section style={{ marginTop: "60vh" }}>
				<h2>
					<span ref={step2Ref}>Settings</span>
				</h2>
				<p>Long settings panel…</p>
			</section>

			<section style={{ marginTop: "60vh" }}>
				<h2>
					<span ref={step3Ref}>Save</span>
				</h2>
				<button>Save</button>
			</section>

			<HUD quest={quest} />

			<QuestMarker target={currentTarget} label={snap.step?.label} />
		</div>
	);
}

function HUD({ quest }: { quest: Quest }) {
	const [snap, setSnap] = useState(quest.current());
	useEffect(() => quest.subscribe(setSnap), [quest]);
	const target = snap.step?.getTarget() ?? null;

	return (
		<div
			style={{
				position: "fixed",
				right: 16,
				bottom: 16,
				background: "#000",
				color: "#fff",
				padding: "12px 14px",
				borderRadius: 10,
				boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
				display: "grid",
				gap: 8,
				minWidth: 260,
			}}
		>
			<div style={{ fontWeight: 600 }}>
				{snap.done ? "Quest Complete ✅" : (snap.step?.label ?? "No step")}
			</div>
			{!snap.done && (
				<div style={{ display: "flex", gap: 8 }}>
					<button onClick={() => quest.prev()}>Prev</button>
					<button
						onClick={() =>
							target?.scrollIntoView({ behavior: "smooth", block: "center" })
						}
						disabled={!target}
					>
						Jump
					</button>
					<button onClick={() => quest.next()}>Next</button>
				</div>
			)}
		</div>
	);
}
