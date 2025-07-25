const express = require('express');
const permisoController = require('../controllers/permiso');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

module.exports = (connection) => {
  const controller = permisoController(connection);

  router.post('/permiso', controller.permiso);
  router.get('/permiso', controller.consultar);
  router.get('/permiso/:idpermiso', controller.consultarId);
  router.patch('/permiso/:idpermiso', controller.actualizarPermiso);
  router.delete('/permiso/:idpermiso', controller.eliminarPermiso);

  return router;
};
