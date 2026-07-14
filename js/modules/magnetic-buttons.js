export function initMagneticButtons() {
	document.querySelectorAll("[data-magnetic]").forEach((button) => {
		button.addEventListener("mousemove", (event) => {
			const rect = button.getBoundingClientRect();
			const x = ((event.clientX - rect.left) / rect.width) * 100;
			const y = ((event.clientY - rect.top) / rect.height) * 100;
			button.style.setProperty("--glow-x", `${x}%`);
			button.style.setProperty("--glow-y", `${y}%`);
		});
	});
}
