const fs = require('fs');

const data = `
# session_secret
SESSION_SECRET=9ad71ea40fff6ec5a7d6cc0895c800e4

# mongodb_url
MONGODB_URL=mongodb://127.0.0.1:27017

# database_name 
DB_NAME=limsapp
`;

fs.writeFile('.env', data, err => {
	if (err) {
		console.log('error occured while creating .env file');
	} else {
		console.log('Setup done...');
		console.log(
			'Now install Redis for windows and Mongodb as windows service and then run `npm install`'
		);
	}
});
