const mongo = require('../services/db_client');
const getIssueHistory = require('./issue_history');

function builder(regex, extras) {
	let query = {};

	query = {
		$and: [{ inst_id: +extras.inst_id }]
	};

	if (extras.singleQuery) {
		query.$and.push({
			[extras.keyName]:
				!extras.forStudents && !isNaN(+extras.term)
					? +extras.term
					: { $regex: regex }
		});
	} else {
		// try to convert the term into number if then use the `uid` otherwise `$or` query but make sure it is not for `students` collection
		let value =
			!extras.forStudents && !isNaN(+extras.term)
				? { uid: +extras.term }
				: {
						$or: [
							{ name: { $regex: regex } },
							{ [extras.fieldName]: { $regex: regex } },
							{ branch: { $regex: regex } }
						]
				  };
		query.$and.push(value);
	}

	// for debug purpose only
	// console.log(extras, JSON.stringify(query));

	return query;
}

function buildQuery(term, options, collection) {
	let regex = new RegExp(`${term}`, 'i'),
		extras = {
			forStudents: false,
			fieldName: 'author',
			term,
			keyName: options.type,
			inst_id: options.inst_id,
			singleQuery: !!options.type
		};

	if (collection === 'students') {
		extras.forStudents = true;
		extras.fieldName = 'rollno';
	}

	return term && term.trim() ? builder(regex, extras) : {};
}

/**
 *
 * @param {*} term for making the search query
 * @param {*} options for alternate options such as `type`
 * @param {*} collectionName for collection name in db
 */
async function search(term, options, collectionName) {
	let result = [];

	try {
		var client = await mongo();

		// need to convert the `term` into string (bug fix of number)
		let query = buildQuery(`${term}`, options, collectionName);

		result = await client.db
			.collection(collectionName)
			.find(query)
			.toArray();
	} catch (error) {
		console.log(
			error,
			`api: <error from db> cannot able to perform search on ${collectionName} collection`
		);
	} finally {
		client && client.close();
	}

	return result;
}

/** Search for issue record
 * @param data { type: 'book_id', book_id: 23, inst_id: 1}
 * @param collectionName 'books'
 * @example
 * data {
 *  'type': 'student_id', // searchTerm
 * 'student_id': '3115001',
 * 'inst_id': 1
 * }
 *
 * collectionName 'students'
 */
async function getIssueRecord(data, collectionName = 'students') {
	let result = {
			ok: 0
		},
		searchTerm = data.all ? '' : data[data.type];

	// uid setting for student collection
	if (collectionName === 'students' && data.type != 'branch') {
		searchTerm = `${data.inst_id}-${searchTerm}`; // inst_id-student_id
	}

	// reset the book_name to just `name`
	// as book search only use it
	let type = data.type.match('book_name') ? 'name' : data.type;

	try {
		let collection = await search(
			searchTerm, // search term such as id, name, branch value like 'let us c'
			{
				type: type.match('_id') ? 'uid' : type, // book_id / student_id / branch / book name
				inst_id: +data.inst_id
			},
			collectionName
		);

		// check if student or book exists ?
		if (!collection.length) {
			result.msg = `${collectionName} not found`;
			return result;
		}

		// try to convert into number but leaving student roll no in string format
		if (!isNaN(+searchTerm) && collectionName != 'students') {
			searchTerm = +searchTerm;
		}

		// reset student uid again to just roll no. as issue_record only use it
		if (collectionName === 'students' && searchTerm.match('-')) {
			searchTerm = searchTerm.substring(searchTerm.indexOf('-') + 1); // from 1-1234 to 1234
		}

		let response = await getIssueHistory(data, collection); // return {ok: 1/0, resultArray: []}

		result = { ...response };
	} catch (error) {
		console.log(error, 'api: student issue record<database error>');
	}

	return result;
}

module.exports = {
	search,
	getIssueRecord
};
