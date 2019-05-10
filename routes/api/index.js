const { Router } = require('express');
const BOOK_ROUTES = require('./book_routes');
const STUDENT_ROUTES = require('./student_routes');

const router = Router();

router.use('/book', BOOK_ROUTES);
router.use('/student', STUDENT_ROUTES);

module.exports = router;
