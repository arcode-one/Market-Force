export function initFaq() {
	const faqLists = document.querySelectorAll("[data-faq]");

	faqLists.forEach((list) => {
		const items = Array.from(list.querySelectorAll("[data-faq-item]"));

		const closeItem = (item) => {
			const button = item.querySelector(".faq-item__question");
			const panel = item.querySelector(".faq-item__panel");

			item.classList.remove("is-open");
			button?.setAttribute("aria-expanded", "false");
			if (panel) {
				panel.style.maxHeight = "0px";
				panel.setAttribute("aria-hidden", "true");
			}
		};

		const openItem = (item) => {
			const button = item.querySelector(".faq-item__question");
			const panel = item.querySelector(".faq-item__panel");

			item.classList.add("is-open");
			button?.setAttribute("aria-expanded", "true");
			if (panel) {
				panel.style.maxHeight = `${panel.scrollHeight}px`;
				panel.setAttribute("aria-hidden", "false");
			}
		};

		items.forEach((item) => {
			const button = item.querySelector(".faq-item__question");

			button?.addEventListener("click", () => {
				const isOpen = item.classList.contains("is-open");

				items.forEach((otherItem) => closeItem(otherItem));
				if (!isOpen) openItem(item);
			});
		});

		window.addEventListener("resize", () => {
			items.forEach((item) => {
				if (item.classList.contains("is-open")) openItem(item);
			});
		});
	});
}
