const express = require('express');
const rolController = require('../controllers/rol');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

module.exports = (connection) => {
  const controller = rolController(connection);

  router.post('/rol', controller.rol);
  router.get('/rol', controller.consultar);
  router.get('/rol/:id', controller.consultarId);
  router.patch('/rol/:id', controller.actualizarRol);
  router.delete('/rol/:id', controller.eliminarRol);
 

  return router;
};