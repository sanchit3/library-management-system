const { Router } = require('express');
const { join } = require('path');

const { validateFields, buildAlerts, user } = require('../services/inst_auth');

const router = Router();

const TEMPLATE_DIR = join('templates', 'home');

router.post('/reg', (req, res, next) => {
	const formStatus = validateFields(req.body, 5);

	if (formStatus.isValid) {
		user.register(req.body).then(status => {
			if (status.ok) {
				res.render(join(TEMPLATE_DIR, 'login'), {
					alert: buildAlerts(
						'<strong>Registered Successfully !</strong> You can log in now.',
						'success'
					)
				});
			} else if (status.userExists) {
				res.render(join(TEMPLATE_DIR, 'reg'), {
					alert: buildAlerts(
						'<strong>Email address already exists !</strong>',
						'danger'
					)
				});
			} else {
				res.render(join(TEMPLATE_DIR, 'reg'), {
					alert: buildAlerts(
						'<strong>Something went wrong !</strong> Please try after some time.',
						'warning'
					)
				});
			}
		});
	} else {
		res.render(join(TEMPLATE_DIR, 'reg'), {
			alert: buildAlerts(
				'<strong> Invalid Inputs!</strong > Please provide accurate details.',
				'danger'
			),
			formStatus,
			values: { ...req.body }
		});
	}
});

router.post('/login', (req, res, next) => {
	const formStatus = validateFields(req.body, 2);
	if (formStatus.isValid) {
		user.login(req.body).then(status => {
			if (status.ok) {
				req.session.user = status.data;
				res.redirect('/dashboard');
			} else {
				res.render(join(TEMPLATE_DIR, 'login'), {
					alert: buildAlerts(
						'<strong>Email or Password is invalid !</strong>',
						'warning'
					)
				});
			}
		});
	} else {
		res.render(join(TEMPLATE_DIR, 'login'), {
			alert: buildAlerts(
				'<strong>Invalid Inputs !</strong> Please provide accurate details.',
				'danger'
			),
			formStatus,
			values: { ...req.body }
		});
	}
});

module.exports = router;
