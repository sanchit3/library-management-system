const bcrypt = require('bcrypt');
const mongo = require('./db_client');
const SALT_ROUNDS = 10;

class User {
	async register(data) {
		let result = {
			ok: 0
		};

		let isUserExists = await this.isEmailExists(data.inst_email);

		if (isUserExists) {
			result.userExists = true;
			return result;
		}

		try {
			data.inst_pwd = await bcrypt.hash(data.inst_pwd, SALT_ROUNDS);

			const client = await mongo();

			const counter = await client.db
				.collection('counters')
				.findOneAndUpdate(
					{ name: 'inst_id' },
					{ $inc: { seq: 1 } },
					{ returnOriginal: false, projection: { seq: 1 } }
				);

			if (counter.ok) {
				data.inst_id = counter.value.seq;
			} else {
				throw new Error('cannot able to get an id for institute');
			}

			delete data.conf_pwd;

			const {
				result: { ok }
			} = await client.db.collection('users').insertOne(data);

			result.ok = ok;
			client.close();
		} catch (error) {
			console.log(
				error,
				'password not hashed || database insertion error'
			);
		}

		return result;
	}

	async login(data) {
		let result = {
			ok: 0
		};

		try {
			const record = await this.isEmailExists(data.inst_email);

			if (record) {
				// match the password
				let isMatched = await bcrypt.compare(
					data.inst_pwd,
					record.inst_pwd
				);

				if (isMatched) {
					delete record.inst_pwd;
					result = { ok: 1, data: { ...record } };
				}
			}
		} catch (error) {
			console.log(error, 'bcrypt cannot able to perform a compare');
		}

		return result;
	}

	async isEmailExists(email) {
		try {
			const client = await mongo();

			var record = await client.db
				.collection('users')
				.findOne({ inst_email: email });

			client.close();
		} catch (error) {
			console.log(error, 'database error');
		}

		return record;
	}
}

const fieldsMatcher = {
	pwd: {
		regex: /^(?=.*\d)(?=.*[@#$%^&*!~-])(?=.*[a-zA-Z]).{4,25}$/,
		errorMsg: 'Password must be in Alpha numeric form with symbols'
	},
	inst_name: {
		regex: /^[\w ]{4,120}$/,
		errorMsg: 'Please correct input field'
	},
	inst_email: {
		regex: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
		errorMsg: 'Please provide correct email'
	},
	get inst_pwd() {
		return this.pwd;
	},
	get conf_pwd() {
		return this.pwd;
	},
	inst_type: {
		regex: /^(school|college|other)$/,
		errorMsg: 'Please select one of the option'
	}
};

function validateFields(fields, totalFields = 0) {
	if (totalFields == 0) {
		totalFields = Object.keys(fields).length;
	}

	let correctFields = 0,
		formStatus = {
			isValid: false,
			invalidFields: []
		};

	for (let name in fields) {
		let value = fields[name];

		if (fieldsMatcher[name].regex.test(value) && value.trim()) {
			correctFields += 1;
		} else {
			let { errorMsg } = fieldsMatcher[name];

			formStatus.invalidFields.push({
				name,
				errorMsg
			});
		}
	}

	if ('conf_pwd' in fields && fields['conf_pwd'] != fields['inst_pwd']) {
		const res = formStatus.invalidFields.find(_ => _.name === 'conf_pwd');

		let errorMsg = `Password does not match`;
		// if password is not valid and does not match
		if (res) {
			res.errorMsg += `.<br>${errorMsg}`;
		} else {
			// if password is valid but does not match
			formStatus.invalidFields.push({
				name: 'conf_pwd',
				errorMsg
			});
		}

		correctFields -= 1;
	}

	formStatus.isValid = correctFields == totalFields;

	return formStatus;
}

function buildAlerts(msg, type = 'alert-primary') {
	return {
		msg,
		class: `alert-${type}`
	};
}

module.exports = {
	validateFields,
	buildAlerts,
	user: new User()
};
