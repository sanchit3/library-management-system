const { join } = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
const redisDriver = require('connect-redis');
const dotenv = require('dotenv');
const logger = require('morgan');

dotenv.config();

const SessionStore = redisDriver(session);

const hbsConfig = exphbs({
    defaultLayout: 'main.hbs',
    extname: '.hbs',
    layoutsDir: join(__dirname, 'views', 'layouts'),
    partialsDir: join(__dirname, 'views', 'partials'),
    helpers: require('./services/handlebars_helpers')
});

const sessionConfig = session({
    name: 'LIMS',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({
        host: '127.0.0.1',
        port: '6379',
    })
});

const ASSETS_DIR = join(__dirname, 'assets');

module.exports = {
    HBS: hbsConfig,
    SESSION: sessionConfig,
    ASSETS_DIR,
    LOGGER: logger('tiny')
};
