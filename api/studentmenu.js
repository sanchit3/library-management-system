const Menu = require('./menu');

class Student extends Menu {
	constructor() {
		super();
		this.collectionName = 'students';
	}
	async add(data) {
		let result = {
			ok: 0
		};

		try {
			var client = await this.mongo();

			let instDetail = await client.db.collection('users').findOne({
				inst_id: +data.inst_id
			});

			if (!instDetail) {
				result.msg = 'Institute does not exists';
				return;
			}

			const isExists = await client.db.collection('students').findOne({
				$and: [
					{ inst_id: +data.inst_id },
					{
						$or: [{ email: data.email }, { rollno: data.rollno }]
					}
				]
			});

			if (isExists) {
				result.msg = 'Student already registered';
				return result;
			}

			// extras
			data.institute_name = instDetail.inst_name;
			data.uid = `${data.inst_id}-${data.rollno}`;

			result = await this.insert(client, data);
		} catch (error) {
			console.log(error, 'api: student add<database error>');
		} finally {
			client && client.close();
		}

		return result;
	}

	async edit(student, data) {
		let result = {
			ok: 0,
			msg: 'NOT ABLE TO MODIFY'
		};

		// clone the original student
		let editStudent = { ...student },
			// fields that can be edited
			fields = ['name', 'email', 'branch'];

		// checks the fields to edit
		for (let key of fields) {
			if (key in data) {
				editStudent[key] = data[key];
			}
		}

		try {
			var client = await this.mongo();

			let { result: status } = await client.db
				.collection('students')
				.updateOne({ uid: student.uid }, { $set: editStudent });

			result = status;
			result.data = editStudent;
		} catch (error) {
			console.log(error, 'student edit cannot be done error');
		} finally {
			client && client.close();
		}

		return result;
	}

	async remove(student) {
		let result = {
			ok: 0
		};

		try {
			// check to see if there is any book issued to the student
			let { data: issueResponse } = await this.getIssueRecord({
				type: 'student_id',
				student_id: student.rollno,
				inst_id: student.inst_id
			});

			// console.log(issueResponse);

			// if books are issued then not perform delation if student
			if (issueResponse.length) {
				result.msg = 'UNABLE TO DELETE.AS BOOKS ARE ISSUED TO STUDENT';
				return result;
			}

			var client = await this.mongo();

			let { result: deleteDetails } = await client.db
				.collection('students')
				.deleteOne({ uid: student.uid });

			result.ok = deleteDetails.ok;
		} catch (error) {
		} finally {
			client && client.close();
		}

		return result;
	}

	async modify(mode, data) {
		let result = {
			ok: 0
		};

		try {
			// check student exists
			let studentFound = await this.search(
				data.student_id, // roll no
				{
					type: 'rollno',
					inst_id: data.inst_id
				},
				'students'
			);

			if (!studentFound.length) {
				result.msg = 'STUDENT NOT FOUND';
				return result;
			}

			let operation =
				mode === 'edit'
					? this.edit(studentFound[0], data)
					: this.remove(studentFound[0]);

			let response = await operation;

			result = response;
		} catch (error) {
			console.log(error, `api error: for <${mode}> the student`);
		}

		return result;
	}
}

module.exports = () => new Student();
