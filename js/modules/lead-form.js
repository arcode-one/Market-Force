export function initLeadForm() {
	const form = document.querySelector(".lead-form");
	const contactInput = form?.querySelector("[data-contact-input]");
	const contactLabel = form?.querySelector("[data-contact-label]");
	const contactMethods = form?.querySelectorAll('input[name="contact_method"]');
	const status = form?.querySelector("[data-form-status]");
	const submitButton = form?.querySelector(".lead-form__button");
	const buttonText = submitButton?.querySelector(".button__text");
	const initialButtonText = buttonText?.textContent || "Отправить";

	function setStatus(message = "", state = "") {
		if (!status) return;
		status.textContent = message;
		if (state) status.dataset.state = state;
		else delete status.dataset.state;
	}

	function updateContactField() {
		if (!contactInput || !contactMethods) return;

		const selectedMethod =
			Array.from(contactMethods).find((input) => input.checked)?.value || "phone";

		if (selectedMethod === "telegram") {
			contactInput.type = "text";
			contactInput.inputMode = "text";
			contactInput.placeholder = "@username";
			contactInput.autocomplete = "off";
			if (contactLabel) contactLabel.textContent = "Telegram";
			return;
		}

		contactInput.type = "tel";
		contactInput.inputMode = "tel";
		contactInput.placeholder = "+7 (___) ___-__-__";
		contactInput.autocomplete = "tel";
		if (contactLabel) contactLabel.textContent = "Телефон";
	}

	contactMethods?.forEach((input) => {
		input.addEventListener("change", updateContactField);
	});
	updateContactField();

	form?.addEventListener("submit", async (event) => {
		event.preventDefault();
		setStatus();

		const endpoint = form.getAttribute("action")?.trim();
		if (!endpoint || endpoint === "#") {
			setStatus(
				"Форма подготовлена, но ещё не подключена к обработчику заявок.",
				"error",
			);
			return;
		}

		if (submitButton) submitButton.disabled = true;
		if (buttonText) buttonText.textContent = "Отправляем…";
		form.setAttribute("aria-busy", "true");

		try {
			const response = await fetch(endpoint, {
				method: form.method || "POST",
				body: new FormData(form),
				headers: { Accept: "application/json" },
			});

			if (!response.ok) throw new Error(`Form request failed: ${response.status}`);

			form.reset();
			updateContactField();
			setStatus("Спасибо! Заявка отправлена. Мы свяжемся с вами.", "success");
		} catch {
			setStatus(
				"Не удалось отправить заявку. Попробуйте ещё раз или напишите нам на почту.",
				"error",
			);
		} finally {
			if (submitButton) submitButton.disabled = false;
			if (buttonText) buttonText.textContent = initialButtonText;
			form.removeAttribute("aria-busy");
		}
	});
}
