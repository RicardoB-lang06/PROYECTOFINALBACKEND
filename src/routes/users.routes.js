const express = require('express');
const controller = require('../controllers/users.controller');
const { authMiddleware } = require('../auth');
const { adminMiddleware } = require('../middleware/admin.middleware'); 

// console.log('getAll:', controller.getAll);
// console.log('getById:', controller.getById);
// console.log('Aadmin middleware:', adminMiddleware);

const router = express.Router();

router.post('/register', controller.create);
router.post('/login', controller.loginUser);

router.use(authMiddleware);

router.get('/', adminMiddleware, controller.getAll);

router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = { router };