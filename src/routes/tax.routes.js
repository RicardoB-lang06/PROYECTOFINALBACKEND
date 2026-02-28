const express = require('express');
const controller = require('../controllers/tax.controller'); // Importa el objeto completo
const { authMiddleware } = require('../auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/resumen', controller.getSummary); 
router.get('/calcular', controller.calcular);

module.exports = { router };