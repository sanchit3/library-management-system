const { MongoClient } = require('mongodb');

function createConnection() {
	return MongoClient.connect(process.env.MONGODB_URL, {
		useNewUrlParser: true
	})
		.then(client => ({
			db: client.db(process.env.DB_NAME),
			close: () => client.close()
		}))
		.catch(err => {
			throw err;
		});
}

module.exports = createConnection;
