// server/src/routes/settings.routes.js
const express = require('express');
const settingsController = require('../controllers/settingsController');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);

module.exports = router;
