const router = require('express').Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const {
  getAll, getById, create, update, remove, updateStatus, resetAll
} = require('../controllers/questionController');

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', auth, adminOnly, create);
router.put('/:id', auth, adminOnly, update);
router.put('/:id/status', updateStatus);
router.delete('/:id', auth, adminOnly, remove);
router.post('/reset', auth, adminOnly, resetAll);

module.exports = router;
