import { FormValidator } from './validate.js';
import helperMethods from './validation_helpers.js';

const fieldsValidation = {
	inst_email(input) {
		return helperMethods.test_regex(
			input,
			'email',
			'Good !',
			'Please provide correct email'
		);
	},

	inst_pwd(input) {
		return helperMethods.test_regex(
			input,
			'pwd',
			'Good !',
			'Password must be in Alpha numeric form with symbols'
		);
	}
};

document.body.onload = () => {
	new FormValidator(document.forms[0], { fieldsValidation, totalFields: 2 });
};
