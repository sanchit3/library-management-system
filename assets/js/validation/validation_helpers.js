import regex from './regex.js';

export default {
	getMsgField(currentNode) {
		return $(currentNode).siblings('div.error-msg');
	},
	addMsgInfo(input, msgText, msg, isValid) {
		if (isValid) {
			$(input)
				.addClass('is-valid')
				.removeClass('is-invalid');
			msgText
				.addClass('valid-feedback')
				.removeClass('invalid-feedback')
				.html(msg);
		} else {
			$(input)
				.addClass('is-invalid')
				.remove('is-valid');
			msgText
				.addClass('invalid-feedback')
				.removeClass('valid-feedback')
				.html(msg);
		}
	},
	match_pwd(firstInput) {
		let isValid = true;
		let secondInput = document.querySelector(
			firstInput.id === 'inst_pwd' ? '#conf_pwd' : '#inst_pwd'
		);

		if (secondInput.value.trim()) {
			isValid =
				regex.pwd.test(secondInput.value) &&
				secondInput.value === firstInput.value;
		}

		if (!isValid) {
			this.addMsgInfo(
				firstInput,
				this.getMsgField(firstInput),
				'Passwords not matched',
				isValid
			);
		}

		return isValid;
	},

	test_regex(input, testName, successMsg, errorMsg) {
		let value = input.value;
		let isValid = false;
		let msgText = this.getMsgField(input);

		if (regex[testName].test(value)) {
			isValid = true;
			this.addMsgInfo(input, msgText, successMsg, isValid);
		} else {
			isValid = false;
			this.addMsgInfo(input, msgText, errorMsg, isValid);
		}

		return isValid;
	}
};
