export function initLeadEngine() {
	const engine = document.querySelector("[data-lead-engine]");
	if (!engine) return;

	const nodes = Array.from(engine.querySelectorAll("[data-flow-node]"));
	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
	let activeIndex = 0;
	let cycleTimer = 0;
	let frame = 0;

	const activateNode = (index) => {
		activeIndex = index;
		nodes.forEach((node, nodeIndex) => {
			node.classList.toggle("is-active", nodeIndex === activeIndex);
		});
	};

	const stopCycle = () => window.clearInterval(cycleTimer);
	const startCycle = () => {
		stopCycle();
		if (reduceMotion.matches || nodes.length < 2) return;

		cycleTimer = window.setInterval(() => {
			activateNode((activeIndex + 1) % nodes.length);
		}, 2200);
	};

	const updatePointer = (event) => {
		const rect = engine.getBoundingClientRect();
		const x = (event.clientX - rect.left) / rect.width;
		const y = (event.clientY - rect.top) / rect.height;

		window.cancelAnimationFrame(frame);
		frame = window.requestAnimationFrame(() => {
			engine.style.setProperty("--pointer-x", `${x * 100}%`);
			engine.style.setProperty("--pointer-y", `${y * 100}%`);
			engine.style.setProperty("--shift-x", `${(x - 0.5) * 8}px`);
			engine.style.setProperty("--shift-y", `${(y - 0.5) * 8}px`);
			engine.style.setProperty("--shift-x-reverse", `${(0.5 - x) * 8}px`);
			engine.style.setProperty("--shift-y-reverse", `${(0.5 - y) * 8}px`);
		});
	};

	const resetPointer = () => {
		engine.style.setProperty("--pointer-x", "50%");
		engine.style.setProperty("--pointer-y", "50%");
		engine.style.setProperty("--shift-x", "0px");
		engine.style.setProperty("--shift-y", "0px");
		engine.style.setProperty("--shift-x-reverse", "0px");
		engine.style.setProperty("--shift-y-reverse", "0px");
	};

	nodes.forEach((node, index) => {
		node.addEventListener("pointerenter", () => {
			stopCycle();
			activateNode(index);
		});
	});

	engine.addEventListener("pointermove", updatePointer);
	engine.addEventListener("pointerleave", () => {
		resetPointer();
		startCycle();
	});
	reduceMotion.addEventListener?.("change", startCycle);

	startCycle();
}
