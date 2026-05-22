// server/src/routes/db.routes.js
const express = require('express');
const dbController = require('../controllers/dbController');
const router = express.Router();

router.get('/status', dbController.checkConnection);
router.post('/migrate', dbController.runMigration);
router.get('/migrate', dbController.runMigration);

module.exports = router;
