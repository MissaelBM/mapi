const express = require('express');
const tesoroController = require('../controllers/tesoro');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

module.exports = (connection) => {
  const controller = tesoroController(connection);

  router.post('/tesoro', controller.crearTesoro);
  router.get('/tesoro',controller.consultar);
  router.get('/tesoro/:id', controller.consultarId);
  router.patch('/tesoro/:id', controller.actualizarTesoro);
  router.delete('/tesoro/:id', controller.eliminarTesoro);

  return router;
};