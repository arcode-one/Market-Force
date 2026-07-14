export function initReveal() {
	const elements = Array.from(document.querySelectorAll("[data-animate]"));
	if (!elements.length || !("IntersectionObserver" in window)) return;

	document.documentElement.classList.add("has-reveal");

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				entry.target.classList.add("is-visible");
				observer.unobserve(entry.target);
			});
		},
		{ threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
	);

	elements.forEach((element) => {
		const delay = element.getAttribute("data-delay");
		if (delay) element.style.setProperty("--delay", `${delay}ms`);
		observer.observe(element);
	});
}
