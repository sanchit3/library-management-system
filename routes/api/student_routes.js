const { Router } = require('express');
const Student = require('../../api/studentmenu');

const router = Router();

/**
 * Add Student to db
 */
router.post('/add', (req, res, next) => {
	let student = Student();

	// setting inst_id for the student
	req.body.inst_id = +req.session.user.inst_id;

	student.add(req.body).then(status => {
		res.statusCode = 200;
		if (status.ok) {
			res.send(`${status.data}`);
		} else if (status.msg) {
			res.send(`Failed: ${status.msg}`);
		} else {
			res.sendStatus(503);
		}
	});
});

router.post('/search', (req, res, next) => {
	let student = Student();

	student
		.search(req.body.term, {
			type: req.body.type,
			inst_id: req.session.user.inst_id
		})
		.then(data => res.json(data));
});

/*
 * data {
 *  'type': 'student_id', // searchTerm
 * 'student_id': '3115001',
 * 'inst_id': 1
 * }
 */
router.post('/issuerecord', (req, res, next) => {
	let student = Student(),
		details = {
			type: 'student_id',
			student_id: req.body.term,
			inst_id: req.session.user.inst_id
		};
	student.getIssueRecord(details).then(status => {
		res.statusCode = 200;
		if (status.ok) {
			res.json('data' in status ? status.data : {});
		} else if (status.msg) {
			res.send(`Failed: ${status.msg}`);
		} else {
			res.sendStatus(503);
		}
	});
});

router.post('/modifystu', (req, res, next) => {
	let student = Student(),
		mode = req.query.mode;

	if (mode != 'edit' && mode != 'del') {
		res.statusCode = 200;
		res.send(`Failed: invaild operation`);
		return;
	}

	// setting inst_id for the student
	req.body.inst_id = +req.session.user.inst_id;

	student.modify(mode, req.body).then(status => {
		res.statusCode = 200;
		if (status.ok) {
			res.json('data' in status ? status.data : {});
		} else if (status.msg) {
			res.send(`Failed: ${status.msg}`);
		} else {
			res.sendStatus(503);
		}
	});
});

module.exports = router;
