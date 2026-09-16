const router = require('express').Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const scorerOrAdmin = require('../middleware/scorerOrAdmin');
const {
  getAll, getById, create, bulkCreate, update, remove
} = require('../controllers/participantController');

// Scorers and Admins can view participants
router.get('/', auth, scorerOrAdmin, getAll);
router.get('/:id', auth, scorerOrAdmin, getById);

// Creation, editing and deletion are strictly admin-only
router.post('/', auth, adminOnly, create);
router.post('/bulk', auth, adminOnly, bulkCreate);
router.put('/:id', auth, adminOnly, update);
router.delete('/:id', auth, adminOnly, remove);

module.exports = router;
