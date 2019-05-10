const HELPERS = {
	auth_error_script(invalidFields, form) {
		let js = `<script defer> 
                    document.body.onload = () => {`;

		// loop over input fields for form
		for (let name in form) {
			let value = form[name];

			// add value to each field in form
			js += `\$('#${name}').val('${value.trim()}');`;

			// find the invalid field
			let invalidField = invalidFields.find(_ => _.name === name);

			// if there is no invalid field found then skip the itration
			if (!invalidField) continue;

			// add the message to invalid field
			js += `\$('#${
				invalidField.name
			}').addClass('is-invalid').siblings('div.error-msg').addClass('invalid-feedback').html('${
				invalidField.errorMsg
			}');`;
		}

		js += `}
        </script>`;

		return js;
	},

	if_cond(v1, operator, v2, options) {
		switch (operator) {
			case '==':
				return v1 == v2 ? options.fn(this) : options.inverse(this);
			case '!=':
				return v1 != v2 ? options.fn(this) : options.inverse(this);
			default:
				return options.inverse(this);
		}
	}
};

module.exports = HELPERS;
