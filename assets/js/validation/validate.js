export class FormValidator {
	constructor(documentForm, formData) {
		this.fieldsValidation = formData.fieldsValidation;
		this.totalFields = formData.totalFields;

		this.inputs = this.initInputFields(documentForm);

		documentForm.addEventListener('submit', event => {
			event.preventDefault();

			if (this.validateForm(this.inputs)) {
				documentForm.submit();
			}
		});
	}

	initInputFields(documentForm) {
		return [...documentForm]
			.filter(
				input => input.type !== 'select-one' && input.type !== 'submit'
			)
			.map(input => {
				input.addEventListener('input', () =>
					this.validateField(input)
				);
				input.value = '';

				return input;
			});
	}
	validateField(input) {
		return this.fieldsValidation[input.id](input);
	}
	validateForm(inputs) {
		let correctFields = 0;

		for (let input of inputs) {
			if (this.validateField(input) && input.value.trim()) {
				correctFields += 1;
			}
		}

		return correctFields == this.totalFields;
	}
}
