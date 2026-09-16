const router = require('express').Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { getStatus, updateStatus, resetEvent } = require('../controllers/eventController');

router.get('/status', getStatus);
router.put('/status', auth, adminOnly, updateStatus);
router.post('/reset', auth, adminOnly, resetEvent);

module.exports = router;
