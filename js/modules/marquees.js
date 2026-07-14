export function initMarquees() {
	function setupMarquees() {
		document.querySelectorAll("[data-marquee]").forEach((track) => {
			const sourceList = track.querySelector(".logo-strip__list");
			if (!sourceList) return;

			track
				.querySelectorAll("[data-marquee-clone]")
				.forEach((clone) => clone.remove());

			const sourceWidth = sourceList.scrollWidth;
			const viewportWidth =
				track.parentElement?.clientWidth || document.documentElement.clientWidth;
			const repeats = Math.max(3, Math.ceil((viewportWidth * 2.5) / sourceWidth) + 2);

			for (let index = 1; index < repeats; index += 1) {
				const clone = sourceList.cloneNode(true);
				clone.setAttribute("aria-hidden", "true");
				clone.setAttribute("data-marquee-clone", "");
				track.appendChild(clone);
			}

			track.style.setProperty("--marquee-distance", `${sourceWidth}px`);
			track.style.setProperty(
				"--marquee-duration",
				`${Math.max(18, sourceWidth / 58)}s`,
			);
		});
	}

	window.addEventListener("resize", setupMarquees);
	window.addEventListener("load", setupMarquees);
	document.fonts?.ready.then(setupMarquees);
	setupMarquees();

	if ("ResizeObserver" in window) {
		const marqueeResizeObserver = new ResizeObserver(setupMarquees);
		document.querySelectorAll(".logo-strip").forEach((strip) => {
			marqueeResizeObserver.observe(strip);
		});
	}
}
