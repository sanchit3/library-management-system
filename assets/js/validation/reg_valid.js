import { FormValidator } from './validate.js';
import helperMethods from './validation_helpers.js';

const fieldsValidation = {
	inst_name(input) {
		return helperMethods.test_regex(
			input,
			'name',
			'Good !',
			'Please correct input field'
		);
	},

	inst_email(input) {
		return helperMethods.test_regex(
			input,
			'email',
			'Good !',
			'Please provide correct email'
		);
	},

	inst_pwd(input) {
		let isValid = false;

		isValid = helperMethods.test_regex(
			input,
			'pwd',
			'Good !',
			'Password must be in Alpha numeric form with symbols'
		);

		isValid = helperMethods.match_pwd(input);

		return isValid;
	},

	conf_pwd(input) {
		let isValid = false;

		isValid = helperMethods.test_regex(
			input,
			'pwd',
			'Good !',
			'Password must be in Alpha numeric form with symbols'
		);

		isValid = helperMethods.match_pwd(input);

		return isValid;
	}
};

document.body.onload = () => {
    new FormValidator(document.forms[0], { fieldsValidation, totalFields: 4});
};
