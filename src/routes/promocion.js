const express = require('express');
const promocionController = require('../controllers/promocion');
const upload = require('../middleware/multer'); 

const router = express.Router();

module.exports = (connection) => {
    const controller = promocionController(connection);

    router.post('/promocion', upload.array('images', 4), controller.promocion);
    router.get('/promocion', controller.consultar);
    router.get('/promocionPremium', controller.promocionPremium);
    router.get('/promocion/:id', controller.consultarId);
    router.get('/promocion/usuario/:id', controller.promocionPorUsuario);
    router.get('/promocion/tipopromocion/:id', controller.promocionPorTipoPromocion);
   router.patch('/promocion/:id', upload.array('images'), controller.actualizarPromocion);
    router.delete('/promocion/:id', controller.eliminarPromocion);
    router.post('/promocionGeneral', upload.array('images', 4), controller.promocionGeneral);
    router.post('/promocionRango', controller.consultarPorRango);
    router.post('/promocion/reclamar/:token', controller.reclamarPromocion);
    router.get('/promocion/categoria/:id', controller.promocionPorCategoria);

    return router;
};
