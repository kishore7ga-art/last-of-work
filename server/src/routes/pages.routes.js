const express = require('express');
const pagesController = require('../controllers/pages.controller');
// Auth middleware removed
const { cache } = require('../middleware/cache.middleware');

const router = express.Router();

router.get('/public/:slug', pagesController.getPublicPageBySlug);

router.get('/', cache(30), pagesController.getAllPages);
router.post('/', pagesController.createPage);
router.post('/ai/generate', pagesController.generateContent);
router.get('/:id', cache(60), pagesController.getPage);
router.put('/:id', pagesController.updatePage);
router.delete('/:id', pagesController.deletePage);
router.post('/:id/publish', pagesController.publishPage);
router.post('/:id/duplicate', pagesController.duplicatePage);
router.get('/:id/versions', pagesController.getPageVersions);
router.post('/:id/versions/:versionId/restore', pagesController.restorePageVersion);

module.exports = router;
