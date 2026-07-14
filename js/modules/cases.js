export function initCases() {
	const viewport = document.querySelector("[data-cases]");
	const nextButton = document.querySelector("[data-case-next]");
	const prevButton = document.querySelector("[data-case-prev]");

	if (!viewport) return;

	const originalCards = [...viewport.querySelectorAll(".case-card")];
	if (originalCards.length < 2) return;

	const cloneCount = Math.min(3, originalCards.length);
	let isPointerDown = false;
	let isDragging = false;
	let startX = 0;
	let startScrollLeft = 0;
	let dragDeltaX = 0;
	let activePointerId = null;
	let suppressClick = false;
	let isAnimating = false;
	let queuedDirection = 0;
	let settleTimer = 0;
	let scrollDebounceTimer = 0;

	const getGap = () => {
		const styles = window.getComputedStyle(viewport);
		return Number.parseFloat(styles.columnGap || styles.gap) || 18;
	};

	const getStep = () => {
		const card = viewport.querySelector(".case-card");
		return card ? card.getBoundingClientRect().width + getGap() : 360;
	};

	const makeClone = (card) => {
		const clone = card.cloneNode(true);
		clone.dataset.clone = "true";
		clone.setAttribute("aria-hidden", "true");
		clone.classList.add("is-visible");
		clone.removeAttribute("data-animate");
		clone.removeAttribute("data-delay");
		clone.style.removeProperty("--delay");
		clone.querySelectorAll("a, button, [tabindex]").forEach((node) => {
			node.setAttribute("tabindex", "-1");
		});
		return clone;
	};

	viewport.prepend(...originalCards.slice(-cloneCount).map(makeClone));
	viewport.append(...originalCards.slice(0, cloneCount).map(makeClone));

	const getBounds = () => {
		const step = getStep();
		const start = step * cloneCount;
		const end = start + step * originalCards.length;
		return { step, start, end };
	};

	const jumpTo = (left) => {
		const behavior = viewport.style.scrollBehavior;
		viewport.style.scrollBehavior = "auto";
		viewport.scrollLeft = left;
		viewport.style.scrollBehavior = behavior;
	};

	const normalize = () => {
		const { step, start, end } = getBounds();
		const loopWidth = step * originalCards.length;

		if (viewport.scrollLeft < start - step / 2) {
			jumpTo(viewport.scrollLeft + loopWidth);
		}

		if (viewport.scrollLeft >= end - step / 2) {
			jumpTo(viewport.scrollLeft - loopWidth);
		}
	};

	const settleImmediately = () => {
		const { step } = getBounds();
		const target = Math.round(viewport.scrollLeft / step) * step;
		jumpTo(target);
		normalize();
	};

	const finishControlledScroll = () => {
		if (!isAnimating) return;

		window.clearTimeout(settleTimer);
		settleImmediately();
		isAnimating = false;

		const direction = queuedDirection;
		queuedDirection = 0;

		if (direction) {
			window.requestAnimationFrame(() => scrollByCards(direction));
		}
	};

	const scheduleControlledFinish = () => {
		window.clearTimeout(settleTimer);
		settleTimer = window.setTimeout(finishControlledScroll, 420);
	};

	const scrollByCards = (direction) => {
		const nextDirection = Math.sign(direction);
		if (!nextDirection) return;

		if (isAnimating) {
			queuedDirection = nextDirection;
			return;
		}

		window.clearTimeout(scrollDebounceTimer);
		settleImmediately();
		const { step } = getBounds();
		const current = Math.round(viewport.scrollLeft / step) * step;
		isAnimating = true;
		viewport.scrollTo({ left: current + step * nextDirection, behavior: "smooth" });
		scheduleControlledFinish();
	};

	const snapToCard = () => {
		const { step } = getBounds();
		const target = Math.round(viewport.scrollLeft / step) * step;
		window.clearTimeout(scrollDebounceTimer);
		queuedDirection = 0;
		isAnimating = true;
		viewport.scrollTo({ left: target, behavior: "smooth" });
		scheduleControlledFinish();
	};

	const scrollFromDrag = (direction) => {
		const nextDirection = Math.sign(direction);
		if (!nextDirection) {
			snapToCard();
			return;
		}

		const { step } = getBounds();
		const origin = Math.round(startScrollLeft / step) * step;
		window.clearTimeout(scrollDebounceTimer);
		queuedDirection = 0;
		isAnimating = true;
		viewport.scrollTo({ left: origin + step * nextDirection, behavior: "smooth" });
		scheduleControlledFinish();
	};

	const getClientX = (event) => event.touches?.[0]?.clientX ?? event.clientX;

	const onPointerDown = (event) => {
		if (event.button !== undefined && event.button !== 0) return;

		if (isAnimating) {
			queuedDirection = 0;
			finishControlledScroll();
		}

		isPointerDown = true;
		isDragging = false;
		dragDeltaX = 0;
		activePointerId = event.pointerId ?? null;
		startX = getClientX(event);
		startScrollLeft = viewport.scrollLeft;

		if (activePointerId !== null && viewport.setPointerCapture) {
			try {
				viewport.setPointerCapture(activePointerId);
			} catch {
				activePointerId = null;
			}
		}
	};

	const onPointerMove = (event) => {
		if (!isPointerDown) return;
		if (activePointerId !== null && event.pointerId !== activePointerId) return;

		const deltaX = getClientX(event) - startX;
		dragDeltaX = deltaX;
		if (Math.abs(deltaX) < 8 && !isDragging) return;

		isDragging = true;
		viewport.classList.add("is-dragging");
		event.preventDefault();
		viewport.scrollLeft = startScrollLeft - deltaX;
	};

	const onPointerUp = (event) => {
		if (!isPointerDown) return;
		if (activePointerId !== null && event.pointerId !== activePointerId) return;

		isPointerDown = false;
		viewport.classList.remove("is-dragging");

		if (
			activePointerId !== null &&
			viewport.hasPointerCapture?.(activePointerId)
		) {
			viewport.releasePointerCapture(activePointerId);
		}
		activePointerId = null;

		if (!isDragging) return;

		suppressClick = true;
		if (Math.abs(dragDeltaX) >= 48) {
			scrollFromDrag(-Math.sign(dragDeltaX));
		} else {
			snapToCard();
		}
		window.setTimeout(() => {
			isDragging = false;
			dragDeltaX = 0;
			suppressClick = false;
		}, 420);
	};

	nextButton?.addEventListener("click", () => scrollByCards(1));
	prevButton?.addEventListener("click", () => scrollByCards(-1));

	viewport.addEventListener("pointerdown", onPointerDown);
	window.addEventListener("pointermove", onPointerMove, { passive: false });
	window.addEventListener("pointerup", onPointerUp);
	window.addEventListener("pointercancel", onPointerUp);
	viewport.addEventListener("dragstart", (event) => event.preventDefault());
	viewport.addEventListener(
		"click",
		(event) => {
			if (!suppressClick) return;
			event.preventDefault();
			event.stopPropagation();
		},
		true,
	);
	viewport.addEventListener(
		"scroll",
		() => {
			window.clearTimeout(scrollDebounceTimer);
			if (isAnimating || isPointerDown) return;

			scrollDebounceTimer = window.setTimeout(() => {
				if (!isAnimating && !isPointerDown) settleImmediately();
			}, 160);
		},
		{ passive: true },
	);
	window.addEventListener("resize", () => {
		window.clearTimeout(settleTimer);
		window.clearTimeout(scrollDebounceTimer);
		isAnimating = false;
		queuedDirection = 0;
		jumpTo(getBounds().start);
	});

	window.requestAnimationFrame(() => {
		jumpTo(getBounds().start);
	});
}
