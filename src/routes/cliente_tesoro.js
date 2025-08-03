const express = require('express');
const cliente_tesoroController = require('../controllers/cliente_tesoro');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

module.exports = (connection) => {
  const controller = cliente_tesoroController(connection);

  router.post('/cliente-tesoro', controller.cliente_tesoro);
  router.get('/cliente-tesoro',controller.consultar);
  router.get('/cliente-tesoro/:id', controller.consultarId);
  router.patch('/cliente-tesoro/:id', controller.actualizar);
  router.delete('/cliente-tesoro/:id', controller.eliminarClienteTesoro);
  router.put('/cliente-tesoro/reclamar', controller.reclamar);


  return router;
};