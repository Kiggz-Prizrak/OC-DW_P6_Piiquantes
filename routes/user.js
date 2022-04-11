const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');
const auth = require('../middleware/auth');

router.post('/signup', userController.signup);
router.post('/login', userController.login);

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getOneUser);
router.put('/:id', auth, userController.modifyUser)
router.delete('/:id', auth, userController.deleteUser)

module.exports = router;