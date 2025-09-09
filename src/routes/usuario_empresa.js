const express = require('express');
const notificacionController = require('../controllers/usuario_empresa');

const router = express.Router();

module.exports = (connection) => {
  const controller = notificacionController(connection);

router.post('/usuario-empresa', controller.usuarioEmpresa);  
  router.get('/usuario-empresa', controller.consultar);

router.get('/usuario-empresa/:id', controller.consultarId);
 router.put('/usuario-empresa/:id', controller.actualizarUsuarioEmpresa);

router.delete('/usuario-empresa/:id', controller.eliminarUsuarioEmpresa);
  return router;
};