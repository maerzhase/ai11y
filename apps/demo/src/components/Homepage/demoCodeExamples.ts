export const demoCodeExamples = {
	navigation: `import { Marker } from "@ui4ai/react";
import { useNavigate } from "react-router-dom";

function NavigationDemo() {
  const navigate = useNavigate();

  return (
    <Marker
      id="nav_route_billing"
      label="Billing Route"
      intent="Navigate to Billing page"
    >
      <a href="/billing" onClick={() => navigate("/billing")}>
        Billing
      </a>
    </Marker>
  );
}`,

	highlight: `import { Marker } from "@ui4ai/react";

function HighlightDemo() {
  return (
    <Marker
      id="highlight_demo_badge"
      label="Feature Badge"
      intent="A badge to highlight"
    >
      <div className="badge">
        ✨ Feature
      </div>
    </Marker>
  );
}`,

	click: `import { Marker } from "@ui4ai/react";
import { useState } from "react";

function ClickDemo() {
  const [count, setCount] = useState(0);

  return (
    <Marker
      id="click_demo_increment"
      label="Increment Button"
      intent="Increases the counter by 1"
    >
      <button onClick={() => setCount(c => c + 1)}>
        +
      </button>
    </Marker>
  );
}`,

	inputFill: `import { Marker } from "@ui4ai/react";
import { useState } from "react";

function InputFillDemo() {
  const [email, setEmail] = useState("");

  return (
    <Marker
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
    </Marker>
  );
}`,
};
