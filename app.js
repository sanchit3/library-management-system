const express = require('express');

const config = require('./app_config');
const routes = require('./routes');

const app = express();

/** App setting */

app.engine('.hbs', config.HBS);
app.set('view engine', '.hbs');

/** Basic middlewares */

app.use(config.SESSION);
// temp session
// app.use((req, res, next) => {
// 	req.session = {};
// 	next();
// });
app.use(config.LOGGER);
app.use('/assets', express.static(config.ASSETS_DIR));
app.use(express.urlencoded({ extended: false }));

/** Routing */

app.use((req, res, next) => {
	let pathname = req.path,
		sessionRunning = 'user' in req.session;

	if (sessionRunning) {
		if (pathname.match(/(dashboard|api)/)) {
			next();
		} else {
			res.redirect('/dashboard');
		}
	} else {
		if (pathname.match(/(dashboard|api)/)) {
			res.redirect('/');
		} else {
			next();
		}
	}
});

app.use('/', routes.HOME_ROUTES);
app.use('/inst', routes.INST_ROUTES);
app.use('/dashboard', routes.DASHBOARD_ROUTES);
app.use('/api', routes.API_ROUTES);

app.use((req, res, next) => {
	res.send(`404 page not found`);
});

app.listen(6700, () => {
	console.log(`Server is listening on port : 6700`);
});
