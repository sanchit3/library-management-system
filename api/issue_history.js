const mongo = require('../services/db_client');

// calculate the fine and mutate the result
function calculateFine(record) {
	let totalFine = 0,
		curDate = new Date();

	record.forEach(book => {
		let returnDate = new Date(book.return_date),
			timeDiff = curDate.getTime() - returnDate.getTime(),
			diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

		book.fine = diffDays > 0 ? diffDays * 1 : 0;
		totalFine += book.fine;
	});
	return totalFine;
}

async function getFine(data, collection) {
	let result = { ok: 0 },
		// use book for book_name, book_id and branch type else student
		docName = data.type.match(/(book_name|book_id|branch|all)/)
			? 'book'
			: 'student',
		keyValue = docName === 'student' ? 'rollno' : 'uid',
		totalFine = 0,
		resultArray = [];

	try {
		var client = await mongo();

		// for each student or book in collection check the issue record
		// if search by `book name` then multiple books will be check for issue record same goes
		// for the `branch` then multiple students will be check for issue record
		for (let doc of collection) {
			totalFine = 0;

			let query = {
				[`${docName}_id`]: doc[keyValue] // book_id: 23
			};

			// console.log(docName);

			let record = await client.db
				.collection('issue_record')
				.find({
					$and: [{ inst_id: +data.inst_id }, query]
				})
				.toArray();

			if (!record.length) {
				continue;
			}

			totalFine = calculateFine(record);

			let extraInfo = {};

			if (docName === 'student') {
				extraInfo.branch = doc.branch;
				extraInfo.rollno = doc.rollno;
			}

			resultArray.push({
				name: doc.name,
				totalFine,
				...extraInfo,
				record
			}); // {totalFine, totalFine, Array}
		}
	} catch (error) {
		console.log(error, `api error: not able to get the fine`);
	} finally {
		client && client.close();
	}

	result.ok = 1;
	result.data = resultArray;

	return result;
}
module.exports = getFine;
