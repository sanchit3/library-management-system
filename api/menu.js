const { search, getIssueRecord } = require('./search');
const mongo = require('../services/db_client');

class Menu {
	constructor() {
		this.mongo = mongo;
		this.data = {};
	}
	async insert(client, data, collectionName = false) {
		let collection = collectionName ? collectionName : this.collectionName;
		let result = {
			ok: 0
		};

		try {
			// extras
			data.inst_id = +data.inst_id;

			const { result: status, ops } = await client.db
				.collection(collection)
				.insertOne(data);

			result.ok = status.ok;
			result.data = ops[0].uid;
		} catch (error) {
			console.log(error, `api: ${collectionName} insert<database error>`);
		}

		return result;
	}

	search(term, options = { type: false }, collectionName = false) {
		return search(
			term,
			options,
			collectionName ? collectionName : this.collectionName
		);
	}

	getIssueRecord(data, collectionName = false) {
		return getIssueRecord(
			data,
			collectionName ? collectionName : this.collectionName
		);
	}
}

module.exports = Menu;
