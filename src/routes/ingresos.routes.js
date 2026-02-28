const express = require('express');
const controller = require('../controllers/ingresos.controller');
const { authMiddleware } = require('../auth');

const router = express.Router();

router.use(authMiddleware); 

router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = { router };