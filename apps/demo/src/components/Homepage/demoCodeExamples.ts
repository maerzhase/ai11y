export const demoCodeExamples = {
	navigation: `import { Mark } from "@ui4ai/react";
import { useNavigate } from "react-router-dom";

function NavigationDemo() {
  const navigate = useNavigate();

  return (
    <Mark
      id="nav_route_billing"
      label="Billing Route"
      intent="Navigate to Billing page"
    >
      <a href="/billing" onClick={() => navigate("/billing")}>
        Billing
      </a>
    </Mark>
  );
}`,

	highlight: `import { Mark } from "@ui4ai/react";

function HighlightDemo() {
  return (
    <Mark
      id="highlight_demo_badge"
      label="Feature Badge"
      intent="A badge to highlight"
    >
      <div className="badge">
        ✨ Feature
      </div>
    </Mark>
  );
}`,

	click: `import { Mark } from "@ui4ai/react";
import { useState } from "react";

function ClickDemo() {
  const [count, setCount] = useState(0);

  return (
    <Mark
      id="click_demo_increment"
      label="Increment Button"
      intent="Increases the counter by 1"
    >
      <button onClick={() => setCount(c => c + 1)}>
        +
      </button>
    </Mark>
  );
}`,

	inputFill: `import { Mark } from "@ui4ai/react";
import { useState } from "react";

function InputFillDemo() {
  const [email, setEmail] = useState("");

  return (
    <Mark
      id="fill_demo_email"
      label="Email Input"
      intent="Email address input field"
    >
      <input
        type="email"
        id="fill_demo_email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
      />
    </Mark>
  );
}`,
};
