const { Router } = require('express');
const { join } = require('path');

const router = Router();

const TEMPLATE_DIR = join('templates', 'home');

router.get('/', (req, res, next) => {
	res.render(join(TEMPLATE_DIR, 'index'));
});

router.get('/search', (req, res, next) => {
	res.render(join(TEMPLATE_DIR, 'search'));
});

router.post('/issuerecord', (req, res, next) => {
	const book = require('../api/bookmenu')();

	let stu_id = req.body.student_id;

	if (!stu_id.trim().length || !stu_id.match(/^\d+-\d+$/)) {
		res.statusCode = 200;
		res.json({});
		return;
	}

	let inst_id = stu_id.substring(0, stu_id.indexOf('-')),
		term = stu_id.substring(stu_id.indexOf('-') + 1);

	book.getFine(term, {
		type: 'student_id',
		inst_id
	}).then(status => {
		if (status.ok) {
			res.statusCode = 200;

			// fetch the inst_name
			require('../services/db_client')().then(async client => {
				let { inst_name } = await client.db
					.collection('users')
					.findOne(
						{ inst_id: +inst_id },
						{ projection: { inst_name: 1 } }
					);

				if (status.data.length) {
					status.data[0].inst_name = inst_name;
				}

				res.json('data' in status ? status.data : {});

				client.close();
			});
		} else if (status.msg) {
			res.statusCode = 422;
			res.send(status.msg);
		} else {
			res.sendStatus(503);
		}
	});
});

router.get('/reg', (req, res, next) => {
	res.render(join(TEMPLATE_DIR, 'reg'));
});

router.get('/login', (req, res, next) => {
	if (req.query.logout === 'success') {
		var alert = {
			msg: '<strong>Logged out successfully !</strong>',
			class: 'alert-success'
		};
	}
	res.render(join(TEMPLATE_DIR, 'login'), { alert });
});

module.exports = router;
