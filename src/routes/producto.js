const express = require('express');
const productoController = require('../controllers/producto');
const router = express.Router();

module.exports = (connection) => {
  const controller = productoController(connection);

  router.post('/producto', controller.crear);
  router.get('/producto',controller.consultar);
  router.get('/producto/:id', controller.consultarId);
  router.patch('/producto/:id', controller.actualizar);
  router.delete('/producto/:id', controller.eliminarProducto);

  return router;
};