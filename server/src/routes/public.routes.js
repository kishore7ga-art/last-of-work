const express = require('express');
const router = express.Router();
const pagesController = require('../controllers/pages.controller');

router.get('/:slug', pagesController.getPublicPageBySlug);

module.exports = router;
