const express = require('express');
const { createSession, getSessions } = require('../controllers/sessionController');

const router = express.Router();

router.get('/', getSessions);
router.post('/', createSession);

module.exports = router;
