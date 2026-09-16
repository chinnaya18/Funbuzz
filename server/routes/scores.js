const router = require('express').Router();
const auth = require('../middleware/auth');
const scorerOrAdmin = require('../middleware/scorerOrAdmin');
const adminOnly = require('../middleware/adminOnly');
const { getAll, getByParticipantId, update, quickAward, getHistory } = require('../controllers/scoreController');

router.get('/', auth, scorerOrAdmin, getAll);
router.get('/:participantId', auth, getByParticipantId);
router.post('/quick-award', auth, scorerOrAdmin, quickAward);
router.put('/:participantId', auth, scorerOrAdmin, update);
router.get('/:participantId/history', auth, scorerOrAdmin, getHistory);

module.exports = router;
