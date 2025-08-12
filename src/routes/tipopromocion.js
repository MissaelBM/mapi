const express = require('express');
const tipopromocionController = require('../controllers/tipopromocion');
const router = express.Router();

module.exports = (connection) => {
  const controller = tipopromocionController(connection);

  router.post('/tipopromocion', controller.crear);
  router.get('/tipopromocion',controller.consultar);
  router.get('/tipopromocion/:id', controller.consultarId);
  router.patch('/tipopromocion/:id', controller.actualizar);
  router.delete('/tipopromocion/:id', controller.eliminarTipoPromocion);

  return router;
};