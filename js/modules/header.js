export function initHeader() {
	const header = document.querySelector("[data-header]");
	const menuToggle = document.querySelector("[data-menu-toggle]");
	const navigation = document.querySelector("#site-navigation");
	const mobileMenu = window.matchMedia("(max-width: 992px)");

	if (!header) return;

	function setMenuState(isOpen) {
		header.classList.toggle("is-open", isOpen);
		menuToggle?.setAttribute("aria-expanded", String(isOpen));
		menuToggle?.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");

		const isHidden = mobileMenu.matches && !isOpen;
		if (navigation) {
			navigation.inert = isHidden;
			if (mobileMenu.matches) navigation.setAttribute("aria-hidden", String(isHidden));
			else navigation.removeAttribute("aria-hidden");
		}
	}

	function updateHeader() {
		header.classList.toggle("is-compact", window.scrollY > 24);
	}

	menuToggle?.addEventListener("click", () => {
		setMenuState(!header.classList.contains("is-open"));
	});

	document.querySelectorAll(".nav__link").forEach((link) => {
		link.addEventListener("click", () => {
			setMenuState(false);
		});
	});

	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && header.classList.contains("is-open")) {
			setMenuState(false);
			menuToggle?.focus();
		}
	});

	mobileMenu.addEventListener?.("change", () => setMenuState(false));

	window.addEventListener("scroll", updateHeader, { passive: true });
	updateHeader();
	setMenuState(false);
}
