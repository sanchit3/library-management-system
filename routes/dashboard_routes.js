const { Router } = require('express');
const { join } = require('path');

const router = Router();

const TEMPLATE_DIR = join('templates', 'dashboard');

router.get('/', (req, res, next) => {
	res.render(join(TEMPLATE_DIR, 'index'), {
		layout: 'dashboard',
		inst_name: req.session.user.inst_name
	});
});

router.get('/issuebook', (req, res, next) => {
	res.render(join(TEMPLATE_DIR, 'issue_book'), {
		layout: 'dashboard',
		inst_name: req.session.user.inst_name
	});
});

router.get('/returnbook', (req, res, next) => {
	res.render(join(TEMPLATE_DIR, 'return_book'), {
		layout: 'dashboard',
		inst_name: req.session.user.inst_name
	});
});

router.get('/searchbook', (req, res, next) => {
	res.render(join(TEMPLATE_DIR, 'search_book'), {
		layout: 'dashboard',
		inst_name: req.session.user.inst_name
	});
});

router.get('/studentmenu', (req, res, next) => {
	res.render(join(TEMPLATE_DIR, 'student_menu'), {
		layout: 'dashboard',
		inst_name: req.session.user.inst_name
	});
});

router.get('/bookmenu', (req, res, next) => {
	res.render(join(TEMPLATE_DIR, 'book_menu'), {
		layout: 'dashboard',
		inst_name: req.session.user.inst_name
	});
});

router.get('/finechecker', (req, res, next) => {
	res.render(join(TEMPLATE_DIR, 'fine_checker'), {
		layout: 'dashboard',
		inst_name: req.session.user.inst_name
	});
});

router.get('/logout', (req, res, next) => {
	req.session.destroy(err => {
		if (err) {
			console.log(err, 'logout cannot be done');
			res.redirect('/dashboard');
		}

		res.redirect('/login?logout=success');
	});
});

module.exports = router;
