export function initDividers() {
	const dividers = [...document.querySelectorAll("[data-divider]")];

	if (!dividers.length) return;

	const updateDivider = (divider) => {
		const value = divider.querySelector("[data-divider-value]");

		if (!value) return;

		value.textContent = `${Math.round(divider.getBoundingClientRect().width)}px`;
	};

	const updateAll = () => dividers.forEach(updateDivider);

	if ("ResizeObserver" in window) {
		const observer = new ResizeObserver((entries) => {
			entries.forEach(({ target }) => updateDivider(target));
		});

		dividers.forEach((divider) => observer.observe(divider));
	} else {
		window.addEventListener("resize", updateAll, { passive: true });
	}

	requestAnimationFrame(updateAll);
	document.fonts?.ready.then(updateAll);
}
