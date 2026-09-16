const router = require('express').Router();
const { adminLogin, scorerLogin, participantLogin, getDemoAccounts, logout } = require('../controllers/authController');

router.post('/admin/login', adminLogin);
router.post('/scorer/login', scorerLogin);
router.post('/participant/login', participantLogin);
router.get('/demo-accounts', getDemoAccounts);
router.post('/logout', logout);

module.exports = router;
