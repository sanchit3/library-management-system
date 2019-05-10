const { Router } = require('express');
const Book = require('../../api/bookmenu');

const router = Router();

/**
 * Add Book to db
 */
router.post('/add', (req, res, next) => {
	let book = Book();

	// setting inst_id for the book
	req.body.inst_id = +req.session.user.inst_id;

	book.add(req.body).then(status => {
		if (status.ok) {
			res.statusCode = 200;
			res.send(`${status.data}`);
		} else {
			res.sendStatus(503);
		}
	});
});

router.post('/issue', (req, res, next) => {
	let book = Book();

	// setting inst_id for the book
	req.body.inst_id = +req.session.user.inst_id;

	book.issue(req.body).then(status => {
		res.statusCode = 200;
		if (status.ok) {
			res.send(status.data);
		} else if (status.msg) {
			res.send(`Failed: ${status.msg}`);
		} else {
			res.sendStatus(503);
		}
	});
});

router.post('/return', (req, res, next) => {
	let book = Book();

	// setting inst_id for the book
	req.body.inst_id = +req.session.user.inst_id;

	book.return(req.body).then(status => {
		res.statusCode = 200;
		if (status.ok) {
			res.send('success');
		} else if (status.msg) {
			res.send(`Failed: ${status.msg}`);
		} else {
			res.sendStatus(503);
		}
	});
});

router.post('/search', (req, res, next) => {
	let book = Book();
	book.search(req.body.term, {
		type: req.body.type,
		inst_id: req.session.user.inst_id
	}).then(data => res.json(data));
});

router.post('/modifybook', (req, res, next) => {
	let book = Book(),
		mode = req.query.mode;

	if (mode != 'edit' && mode != 'del') {
		res.statusCode = 200;
		res.send(`Failed: invaild operation`);
		return;
	}

	// setting inst_id for the book
	req.body.inst_id = +req.session.user.inst_id;

	book.modify(mode, req.body).then(status => {
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

router.post('/finechecker', (req, res, next) => {
	let book = Book();
	book.getFine(req.body.term, {
		type: req.body.type,
		inst_id: req.session.user.inst_id
	}).then(status => {
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
