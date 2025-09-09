const cloudinary = require("../utils/cloudinary");
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode'); 

module.exports = (connection) => {
    return {
        consultar: async (req, res) => {
    try {
      const [promociones] = await connection.promise().query(
        `SELECT 
           p.idpromocion,
           p.empresa_idempresa,
           p.tipopromocion_idtipopromocion,
           p.nombre,
           p.descripcion,
           p.precio,
           p.vigenciainicio,
           p.vigenciafin,
           p.tipo,
           p.maximosusuarios
         FROM promocion p
         WHERE p.eliminado = 0`
      );

      if (!promociones.length) {
        return res.status(404).json({ message: 'No se encontraron promociones' });
      }

      const results = await Promise.all(
        promociones.map(async promocion => {
          // Obtener imágenes
          const [imagenes] = await connection.promise().query(
            `SELECT idimagen, url, public_id 
             FROM imagen 
             WHERE promocion_idpromocion = ?`,
            [promocion.idpromocion]
          );

          // Obtener QRs - solo token y estado, sin generar imagen
          const [qrRows] = await connection.promise().query(
            `SELECT token, usado 
             FROM qr_promocion 
             WHERE promocion_idpromocion = ?`,
            [promocion.idpromocion]
          );

          const qrs = qrRows.map(qr => ({
            token: qr.token,
            url: `${process.env.URL_API}/api/promocion/reclamar/${qr.token}`,
            usado: qr.usado === 1
          }));

          return {
            ...promocion,
            imagenes: imagenes.map(img => ({
              id: img.idimagen,
              url: img.url,
              public_id: img.public_id
            })),
            qrs
          };
        })
      );

      return res.status(200).json(results);
    } catch (error) {
      console.error('Error al consultar promociones:', error);
      return res.status(500).json({ message: 'Error al consultar promociones' });
    }
  },promocionPorCategoria: async (req, res) => {
    const { id } = req.params; // idcategoria

    try {
        const [promociones] = await connection.promise().query(
            `SELECT DISTINCT p.idpromocion,
                    p.empresa_idempresa,
                    p.nombre,
                    p.descripcion,
                    p.vigenciainicio,
                    p.vigenciafin,
                    p.tipo,
                    p.precio
             FROM promocion p
             INNER JOIN combo co ON p.idpromocion = co.promocion_idpromocion
             INNER JOIN combo_producto cp ON co.idcombo = cp.combo_idcombo
             INNER JOIN producto pr ON cp.producto_idproducto = pr.idproducto
             INNER JOIN categoria c ON pr.categoria_idcategoria = c.idcategoria
             WHERE c.idcategoria = ? AND p.eliminado = 0`,
            [id]
        );

        if (promociones.length === 0) {
            return res.status(404).json({ message: 'No se encontraron promociones para esta categoría' });
        }

        // Opcional: traer imágenes asociadas a cada promo
        for (let promo of promociones) {
            const [imagenes] = await connection.promise().query(
                'SELECT idimagen, url, public_id FROM imagen WHERE promocion_idpromocion = ?',
                [promo.idpromocion]
            );

            promo.imagenes = imagenes.map(img => ({
                id: img.idimagen,
                url: img.url,
                public_id: img.public_id
            }));
        }

        res.status(200).json(promociones);

    } catch (error) {
        console.error('Error al consultar promociones por categoría:', error);
        res.status(500).json({ message: 'Error al consultar promociones por categoría' });
    }
}
, promocionPorTipoPromocion: async (req, res) => {
           const { id } = req.params;

            try {

                const [promociones] = await connection.promise().query(
                    `SELECT p.idpromocion,
                    p.empresa_idempresa, 
                    p.tipopromocion_idtipopromocion,
                     p.nombre, 
                     p.descripcion, 
                     p.vigenciainicio, 
                     p.vigenciafin,
                     p.tipo, 
                     p.maximosusuarios, 
                     p.preciooriginal from promocion as p INNER JOIN tipopromocion as t ON p.tipopromocion_idtipopromocion = t.idtipopromocion WHERE t.idtipopromocion =  ? AND p.eliminado = 0`,
                    [id]
                );


                if (promociones.length === 0) {
                    return res.status(404).json({ message: 'Promoción no encontrada' });
                }

                const promocion = promociones[0];
               
               

                const [imagenes] = await connection.promise().query(
                    'SELECT idimagen, url, public_id FROM imagen WHERE promocion_idpromocion = ?',
                    [id]
                );


                const respuesta = {
                    ...promocion,
                    imagenes: imagenes.map(img => ({
                        id: img.idimagen,
                        url: img.url,
                        public_id: img.public_id
                    }))
                };

                res.status(200).json(respuesta);
            } catch (error) {
                console.error('Error al consultar promoción:', error);
                res.status(500).json({ message: 'Error al consultar promoción' });
            }
        } , promocionPorUsuario: async (req, res) => {
           const { id } = req.params;

            try {

                const [promociones] = await connection.promise().query(
                    `SELECT promocion.idpromocion, 
                    promocion.empresa_idempresa, 
                    promocion.categoria_idcategoria,
                    promocion.nombre, 
                    promocion.descripcion,
                    promocion.precio, 
                    promocion.vigenciainicio,
                    promocion.vigenciafin, 
                    promocion.tipo FROM promocion INNER JOIN empresa ON promocion.empresa_idempresa = empresa.idempresa INNER JOIN matriz ON matriz.idmatriz = empresa.matriz_idmatriz INNER JOIN usuario ON  matriz.usuario_idusuario = usuario.idusuario WHERE usuario.idusuario =  ? AND p.eliminado = 0`,
                    [id]
                );


                if (promociones.length === 0) {
                    return res.status(404).json({ message: 'Promoción no encontrada' });
                }

                const promocion = promociones[0];
               
               

                const [imagenes] = await connection.promise().query(
                    'SELECT idimagen, url, public_id FROM imagen WHERE promocion_idpromocion = ?',
                    [id]
                );


                const respuesta = {
                    ...promocion,
                    imagenes: imagenes.map(img => ({
                        id: img.idimagen,
                        url: img.url,
                        public_id: img.public_id
                    }))
                };

                res.status(200).json(respuesta);
            } catch (error) {
                console.error('Error al consultar promoción:', error);
                res.status(500).json({ message: 'Error al consultar promoción' });
            }
        }
        ,
        promocionPremium: async (req, res) => {
            try {

                const [promociones] = await connection.promise().query(
                    `SELECT p.empresa_idempresa, 
                    p.categoria_idcategoria, 
                    p.nombre,
                    p.descripcion,
                    p.precio,
                    p.vigenciainicio, 
                    p.vigenciafin, 
                    p.tipo FROM promocion AS p INNER JOIN empresa AS e ON p.empresa_idempresa = e.idempresa INNER JOIN matriz AS m ON e.matriz_idmatriz = m.idmatriz INNER JOIN usuario AS u ON m.usuario_idusuario = u.idusuario WHERE u.tipodeplan = 'Premium'`
                );


                if (promociones.length === 0) {
                    return res.status(404).json({ message: 'No se encontraron promociones' });
                }


                const promocionesConImagenes = await Promise.all(
                    promociones.map(async (promocion) => {
                        const [imagenes] = await connection.promise().query(
                            'SELECT idimagen, url, public_id FROM imagen WHERE promocion_idpromocion = ?',
                            [promocion.idpromocion]
                        );
                        return {
                            ...promocion,
                            imagenes: imagenes.map(img => ({
                                id: img.idimagen,
                                url: img.url,
                                public_id: img.public_id
                            }))
                        };
                    })
                );

                res.status(200).json(promocionesConImagenes);
            } catch (error) {
                console.error('Error al consultar promociones:', error);
                res.status(500).json({ message: 'Error al consultar promociones' });
            }
        }
        ,
consultarId: async (req, res) => {
    const { id } = req.params;
    try {
        const [promociones] = await connection.promise().query(
            `SELECT 
                p.idpromocion,
                p.empresa_idempresa,
                p.tipopromocion_idtipopromocion,
                p.nombre,
                p.descripcion,
                p.precio,
                p.vigenciainicio,
                p.vigenciafin,
                p.tipo,
                p.maximosusuarios
             FROM promocion p               
             WHERE p.idpromocion = ? AND p.eliminado = 0`,
            [id]
        );

        if (promociones.length === 0) {
            return res.status(404).json({ message: 'Promoción no encontrada' });
        }

        const promocion = promociones[0];

        const [imagenes] = await connection.promise().query(
            'SELECT idimagen, url, public_id FROM imagen WHERE promocion_idpromocion = ?',
            [id]
        );

        const [qrRows] = await connection.promise().query(
            `SELECT token, usado 
             FROM qr_promocion 
             WHERE promocion_idpromocion = ?`,
            [id]
        );

        const qrs = qrRows.map(qr => ({
            token: qr.token,
            url: `${process.env.URL_API}/api/promocion/reclamar/${qr.token}`,
            usado: qr.usado === 1  
        }));

        const respuesta = {
            ...promocion,
            imagenes: imagenes.map(img => ({
                id: img.idimagen,
                url: img.url,
                public_id: img.public_id
            })),
            qrs
        };

        res.status(200).json(respuesta);
    } catch (error) {
        console.error('Error al consultar promoción:', error);
        res.status(500).json({ message: 'Error al consultar promoción' });
    }
},

 

promocion: async (req, res) => {
    // 0.1 Parsear products a un array real (JSON o CSV)
    let productsArr = [];
    const productsRaw = req.body.products;
    if (typeof productsRaw === 'string') {
      try {
        productsArr = JSON.parse(productsRaw);
      } catch {
        productsArr = productsRaw
          .split(',')
          .map(s => s.trim())
          .filter(s => s);
      }
    } else if (Array.isArray(productsRaw)) {
      productsArr = productsRaw;
    }

    // 0.2 Forzar array si viene undefined u otro tipo
    if (!Array.isArray(productsArr)) {
      productsArr = [];
    }

    // 1. Extraer el resto de campos
    const {
      empresa_idempresa,
      tipopromocion_idtipopromocion,
      nombre,
      descripcion,
      precio,
      vigenciainicio,
      vigenciafin,
      tipo,
      maximosusuarios  = 1,
      qrCount          = 0
    } = req.body;

    // 2. Obtener conexión dedicada
    const conn = await connection.promise().getConnection();
    try {
      // 3. Iniciar transacción
      await conn.beginTransaction();

      // 4. Validar empresa
      const [emp] = await conn.query(
        'SELECT 1 FROM empresa WHERE idempresa = ?',
        [empresa_idempresa]
      );
      if (!emp.length) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ message: 'Empresa no existe' });
      }

      // 5. Validar tipo de promoción
      const [tipoProm] = await conn.query(
        'SELECT 1 FROM tipopromocion WHERE idtipopromocion = ?',
        [tipopromocion_idtipopromocion]
      );
      if (!tipoProm.length) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ message: 'Tipo de promoción no existe' });
      }

      // 6. Validar límite de QR vs máximosusuarios
      if (qrCount > maximosusuarios) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({
          message: 'La cantidad de QR no puede exceder el máximo de usuarios'
        });
      }

      // 7. Insertar promoción con máximo de usuarios
      const [promoRes] = await conn.query(
        `INSERT INTO promocion
          (empresa_idempresa, tipopromocion_idtipopromocion, nombre, descripcion,
           precio, vigenciainicio, vigenciafin, tipo, maximosusuarios, eliminado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          empresa_idempresa,
          tipopromocion_idtipopromocion,
          nombre,
          descripcion,
          precio,
          vigenciainicio,
          vigenciafin,
          tipo,
          maximosusuarios
        ]
      );
      const promocionId = promoRes.insertId;

      // 8. Crear combo
      const [comboRes] = await conn.query(
        'INSERT INTO combo (promocion_idpromocion) VALUES (?)',
        [promocionId]
      );
      const comboId = comboRes.insertId;

      // 9. Relacionar productos (usando productsArr)
      if (productsArr.length) {
        const values = productsArr.map(idProd => [comboId, idProd]);
        await conn.query(
          'INSERT INTO combo_producto (combo_idcombo, producto_idproducto) VALUES ?',
          [values]
        );
      }

      // 10. Generar múltiples QR (si qrCount > 0)
      let qrItems = null;
      if (qrCount > 0) {
        const tokens   = Array.from({ length: qrCount }, () => uuidv4());
        const qrValues = tokens.map(token => [token, promocionId]);
        await conn.query(
          'INSERT INTO qr_promocion (token, promocion_idpromocion) VALUES ?',
          [qrValues]
        );

        const urls   = tokens.map(t => `${process.env.URL_API}/api/promociones/reclamar/${t}`);
        const images = await Promise.all(urls.map(u => QRCode.toDataURL(u)));

        qrItems = tokens.map((token, i) => ({
          token,
          url: urls[i],
          imageBase64: images[i]
        }));
      }

      // 11. Subida de imágenes a Cloudinary
      if (req.files && req.files.length) {
        const uploaders = req.files.map(file =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                resource_type: 'image',
                transformation: [
                  { width: 600, height: 450, crop: 'limit' },
                  { quality: 'auto', format: 'webp' }
                ]
              },
              (err, result) => err ? reject(err) : resolve(result)
            );
            stream.end(file.buffer);
          })
        );
        const uploaded = await Promise.all(uploaders);
        const imgValues = uploaded.map(img => [
          img.secure_url,
          img.public_id,
          promocionId
        ]);
        await conn.query(
          'INSERT INTO imagen (url, public_id, promocion_idpromocion) VALUES ?',
          [imgValues]
        );
      }

      // 12. Commit y liberar conexión
      await conn.commit();
      conn.release();

      // 13. Responder
      return res.status(201).json({
        message: 'Promoción creada exitosamente',
        promocionId,
        comboId,
        maximosusuarios,
        qr: qrItems
      });

    } catch (error) {
      console.error('Error al crear promoción con QR múltiple:', error);
      await conn.rollback();
      conn.release();
      return res.status(500).json({ message: 'Error al crear promoción' });
    }
  
}
,

        actualizarPromocion: async (req, res) => {
    const promocionId = req.params.id;
    
    
    if (!req.body) {
        return res.status(400).json({ 
            message: 'No se recibieron datos en el cuerpo de la petición' 
        });
    }

    const {
        empresa_idempresa, 
        categoria_idcategoria, 
        nombre, 
        descripcion, 
        precio, 
        vigenciainicio, 
        vigenciafin, 
        tipo, 
        imagenes_a_eliminar
    } = req.body;

    try {
        
        const [promocionExistente] = await connection.promise().query(
            'SELECT * FROM promocion WHERE idpromocion = ? AND eliminado = 0',
            [promocionId]
        );

        if (promocionExistente.length === 0) {
            return res.status(404).json({ message: 'Promoción no encontrada' });
        }

        const promocion = promocionExistente[0];


if (promocion.idusuario !== req.usuario.idusuario) {
    return res.status(403).json({ message: 'No tienes permiso para actualizar esta promoción' });
}

        
        if (empresa_idempresa) {
            const [empresaResult] = await connection.promise().query(
                'SELECT idempresa FROM empresa WHERE idempresa = ?',
                [empresa_idempresa]
            );
            if (empresaResult.length === 0) {
                return res.status(400).json({ message: 'La empresa especificada no existe' });
            }
        }

    
        if (categoria_idcategoria) {
            const [categoriaResult] = await connection.promise().query(
                'SELECT idcategoria FROM categoria WHERE idcategoria = ?',
                [categoria_idcategoria]
            );
            if (categoriaResult.length === 0) {
                return res.status(400).json({ message: 'La categoría especificada no existe' });
            }
        }

        const updateFields = [];
        const updateValues = [];

        if (empresa_idempresa !== undefined) {
            updateFields.push('empresa_idempresa = ?');
            updateValues.push(empresa_idempresa);
        }
        if (categoria_idcategoria !== undefined) {
            updateFields.push('categoria_idcategoria = ?');
            updateValues.push(categoria_idcategoria);
        }
        if (nombre !== undefined) {
            updateFields.push('nombre = ?');
            updateValues.push(nombre);
        }
        if (descripcion !== undefined) {
            updateFields.push('descripcion = ?');
            updateValues.push(descripcion);
        }
        if (precio !== undefined) {
            updateFields.push('precio = ?');
            updateValues.push(precio);
        }
        if (vigenciainicio !== undefined) {
            updateFields.push('vigenciainicio = ?');
            updateValues.push(vigenciainicio);
        }
        if (vigenciafin !== undefined) {
            updateFields.push('vigenciafin = ?');
            updateValues.push(vigenciafin);
        }
        if (tipo !== undefined) {
            updateFields.push('tipo = ?');
            updateValues.push(tipo);
        }


        if (updateFields.length > 0) {
            updateValues.push(promocionId);
            
            await connection.promise().query(
                `UPDATE promocion SET ${updateFields.join(', ')} WHERE idpromocion = ?`,
                updateValues
            );
        }

        if (imagenes_a_eliminar && Array.isArray(imagenes_a_eliminar) && imagenes_a_eliminar.length > 0) {
            const deletePromises = imagenes_a_eliminar.map(async (public_id) => {
                try {
                    await cloudinary.uploader.destroy(public_id);
                    
                    await connection.promise().query(
                        'DELETE FROM imagen WHERE public_id = ? AND promocion_idpromocion = ?',
                        [public_id, promocionId]
                    );
                } catch (error) {
                    console.error(`Error al eliminar imagen ${public_id}:`, error);
                }
            });

            await Promise.all(deletePromises);
        }

        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map((file) => {
                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            resource_type: "image",
                            format: "webp",
                            transformation: { width: 600, height: 450, crop: "limit" }
                        },
                        (error, result) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result);
                            }
                        }
                    );
                    uploadStream.end(file.buffer);
                });
            });

            try {
                const imageResults = await Promise.all(uploadPromises);

                const insertPromises = imageResults.map((image) => {
                    return connection.promise().query(
                        "INSERT INTO imagen (url, public_id, promocion_idpromocion) VALUES (?, ?, ?)",
                        [image.secure_url, image.public_id, promocionId]
                    );
                });

                await Promise.all(insertPromises);
            } catch (uploadError) {
                console.error('Error al subir imágenes:', uploadError);
                return res.status(500).json({ 
                    message: 'Error al subir las nuevas imágenes', 
                    error: uploadError.message 
                });
            }
        }

        res.status(200).json({ 
            message: 'Promoción actualizada exitosamente', 
            promocionId: parseInt(promocionId)
        });

    } catch (error) {
        console.error('Error al actualizar promoción:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor al actualizar promoción',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
},

        eliminarPromocion: async (req, res) => {
            const { id } = req.params;

            try {

                const [result] = await connection.promise().query(
                    'UPDATE promocion SET eliminado = ? WHERE idpromocion = ?',
                    [1, id]
                );

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: 'Promoción no encontrada' });
                }

                res.status(200).json({ message: 'Promoción eliminada lógicamente' });
            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ message: 'Error' });
            }
        },
        promocionGeneral: async (req, res) => {
            const {
                matriz_idmatriz,
                categoria_idcategoria,
                nombre,
                descripcion,
                precio,
                vigenciainicio,
                vigenciafin,
                tipo,
            } = req.body;

            try {

                const [matrizResult] = await connection.promise().query(
                    'SELECT idmatriz FROM matriz WHERE idmatriz = ?',
                    [matriz_idmatriz]
                );
                if (matrizResult.length === 0) {
                    return res.status(400).json({ message: 'La matriz especificada no existe' });
                }


                const [empresasResult] = await connection.promise().query(
                    'SELECT idempresa FROM empresa WHERE matriz_idmatriz = ?',
                    [matriz_idmatriz]
                );

                if (empresasResult.length === 0) {
                    return res.status(400).json({ message: 'No hay empresas asociadas a la matriz especificada' });
                }


                let imageResults = [];
                if (req.files && req.files.length > 0) {
                    const uploadPromises = req.files.map((file) => {
                        return new Promise((resolve, reject) => {
                            const uploadStream = cloudinary.uploader.upload_stream(
                                {
                                    resource_type: "image",
                                    format: "webp",
                                    transformation: { width: 600, height: 450, crop: "limit" }

                                },
                                (error, result) => {
                                    if (error) {
                                        reject(error);
                                    } else {
                                        resolve(result);
                                    }
                                }
                            );
                            uploadStream.end(file.buffer);
                        });
                    });

                    imageResults = await Promise.all(uploadPromises);
                }


                const insertPromises = empresasResult.map(async (empresa) => {

                    const [result] = await connection.promise().query(
                        'INSERT INTO promocion (empresa_idempresa, categoria_idcategoria, nombre, descripcion, precio, vigenciainicio, vigenciafin, tipo, eliminado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        [empresa.idempresa, categoria_idcategoria, nombre, descripcion, precio, vigenciainicio, vigenciafin, tipo, 0]
                    );

                    const promocionId = result.insertId;


                    if (imageResults.length > 0) {
                        const imageInsertPromises = imageResults.map((image) => {
                            return connection.promise().query(
                                "INSERT INTO imagen (url, public_id, promocion_idpromocion) VALUES (?, ?, ?)",
                                [image.secure_url, image.public_id, promocionId]
                            );
                        });
                        await Promise.all(imageInsertPromises);
                    }

                    return promocionId;
                });

                const promocionesCreadas = await Promise.all(insertPromises);

                res.status(201).json({
                    message: 'Promociones generales creadas con imágenes para todas las empresas de la matriz',
                    promocionesCreadas,
                });
            } catch (error) {
                console.error('Error al crear promociones generales:', error);
                res.status(500).json({ message: 'Error al crear promociones generales' });
            }
        },consultarPorRango: async (req, res) => {
            const { lat, lng, rango } = req.body;
            try {
               const [promociones] = await connection.promise().query(
    `SELECT
        p.idpromocion,
        p.empresa_idempresa,
        p.categoria_idcategoria,
        p.nombre AS promocion_nombre,
        p.descripcion AS promocion_descripcion,
        p.precio,
        p.vigenciainicio,
        p.vigenciafin,
        p.tipo,
        e.nombre AS empresa_nombre,
        e.descripcion AS empresa_descripcion
    FROM promocion AS p
    INNER JOIN empresa AS e ON p.empresa_idempresa = e.idempresa
    WHERE (
        6371000 * acos(
            cos(radians(?)) * cos(radians(ST_Y(e.ubicacion))) *
            cos(radians(ST_X(e.ubicacion)) - radians(?)) +
            sin(radians(?)) * sin(radians(ST_Y(e.ubicacion)))
        )
    ) <= ? AND p.eliminado = 0`,
    [parseFloat(lat), parseFloat(lng), parseFloat(lat), rango]
);

                if (promociones.length === 0) {
                    return res.status(404).json({ message: 'No se encontraron promociones en el rango especificado' });
                }

                const promocionesConImagenes = await Promise.all(
                    promociones.map(async (promocion) => {
                        const [imagenes] = await connection.promise().query(
                            'SELECT idimagen, url, public_id FROM imagen WHERE promocion_idpromocion = ?',
                            [promocion.idpromocion]
                        );
                        return {
                            ...promocion,
                            imagenes: imagenes.map(img => ({
                                id: img.idimagen,
                                url: img.url,
                                public_id: img.public_id
                            }))
                        };
                    })
                );

                res.status(200).json(promocionesConImagenes);
            } catch (error) {
                console.error('Error al consultar promociones por rango:', error);
                res.status(500).json({ message: 'Error al consultar promociones' });
            }
        },reclamarPromocion: async (req, res) => {
  const { idpromocion } = req.body;
  const idcliente = req.user?.idcliente || req.body.idcliente; // desde token o body

  if (!idpromocion || !idcliente) {
    return res.status(400).json({ message: 'Faltan parámetros: idpromocion o idcliente' });
  }

  const conn = await connection.promise().getConnection();

  try {
    await conn.beginTransaction();

    // 1. Validar que la promoción exista y esté vigente
    const [promoRows] = await conn.query(
      `SELECT idpromocion, maximosusuarios, vigenciainicio, vigenciafin
       FROM promocion
       WHERE idpromocion = ? AND eliminado = 0`,
      [idpromocion]
    );

    if (!promoRows.length) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ message: 'Promoción no encontrada' });
    }

    const promo = promoRows[0];
    const now = new Date();
    if (now < new Date(promo.vigenciainicio) || now > new Date(promo.vigenciafin)) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ message: 'Promoción no vigente' });
    }

    // 2. Verificar si ya reclamó la promoción
    const [existente] = await conn.query(
      `SELECT 1 FROM cliente_promocion 
       WHERE cliente_idcliente = ? AND promocion_idpromocion = ?`,
      [idcliente, idpromocion]
    );
    if (existente.length) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ message: 'Ya reclamaste esta promoción' });
    }

    // 3. Validar cupo disponible
    const [reclamos] = await conn.query(
      `SELECT COUNT(*) as total 
       FROM cliente_promocion 
       WHERE promocion_idpromocion = ?`,
      [idpromocion]
    );
    if (reclamos[0].total >= promo.maximosusuarios) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ message: 'Cupo de promoción agotado' });
    }

    // 4. Insertar en cliente_promocion
    const [clientePromoRes] = await conn.query(
      `INSERT INTO cliente_promocion (cliente_idcliente, promocion_idpromocion, fecha) 
       VALUES (?, ?, NOW())`,
      [idcliente, idpromocion]
    );
    const clientePromoId = clientePromoRes.insertId;

    // 5. Generar token JWT único para el QR
    const qrToken = jwt.sign(
      { idcliente, idpromocion, clientePromoId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // el QR expira en 7 días (ajustable)
    );

    const qrUrl = `${process.env.BASE_URL}/api/promocion/validar/${qrToken}`;

    // 6. Generar imagen QR
    const qrImage = await QRCode.toDataURL(qrUrl);

    // 7. Guardar QR en tabla qr_promocion
    await conn.query(
      `INSERT INTO qr_promocion (cliente_promocion_id, token, url) 
       VALUES (?, ?, ?)`,
      [clientePromoId, qrToken, qrUrl]
    );

    await conn.commit();
    conn.release();

    // 8. Devolver QR al cliente
    return res.status(201).json({
      message: 'Promoción reclamada con éxito',
      idpromocion,
      idcliente,
      qrUrl,
      qrImage // base64 que puede mostrar en la app
    });

  } catch (error) {
    console.error('Error al reclamar promoción:', error);
    await conn.rollback();
    conn.release();
    return res.status(500).json({ message: 'Error al reclamar promoción' });
  }
},validarQR: async (req, res) => {
   let conn;
  try {
    conn = await connection.promise().getConnection();

    // 🔑 Decodificar token recibido en la URL
    const rawToken = req.params.token;
    const token = decodeURIComponent(rawToken);

    console.log("🔹 Token recibido (raw):", rawToken);
    console.log("🔹 Token decodificado:", token);

    // 1. Verificar JWT
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_QR_SECRET);
      console.log("✅ Payload decodificado:", payload);
    } catch (err) {
      console.error("❌ Error al verificar JWT:", err.message);
      return res.status(400).json({ message: "QR inválido o expirado" });
    }

    const { idcliente, idpromocion } = payload;

    // 2. Buscar en la tabla qr_promocion
    const [rows] = await conn.query(
      `SELECT * 
         FROM qr_promocion 
        WHERE token = ? 
          AND usado = 0 
          AND fecha_expiracion > NOW()`,
      [token]
    );

    console.log("🔍 Resultado DB:", rows);

    if (!rows.length) {
      return res.status(400).json({ message: "QR no válido" });
    }

    // 3. Si es válido, marcar como usado
    await conn.query(
      `UPDATE qr_promocion SET usado = 1 WHERE idqr_promocion = ?`,
      [rows[0].idqr_promocion]
    );

    return res.status(200).json({
      message: "QR validado exitosamente",
      promocion: idpromocion,
      cliente: idcliente,
    });
  } catch (error) {
    console.error("Error en validarQR:", error);
    return res.status(500).json({ message: "Error al validar QR" });
  } finally {
    if (conn) conn.release();
  }
},consultarReclamado: async (req, res) => {
  try {
    const { idCliente } = req.query; // ⚠️ importante: pasar el id del cliente desde la app

    const [promociones] = await connection.promise().query(
      `SELECT 
         p.idpromocion,
         p.empresa_idempresa,
         p.tipopromocion_idtipopromocion,
         p.nombre,
         p.descripcion,
         p.precio,
         p.vigenciainicio,
         p.vigenciafin,
         p.tipo,
         p.maximosusuarios,
         -- este LEFT JOIN checa si el cliente ya reclamó
         CASE WHEN cp.idcliente IS NULL THEN 0 ELSE 1 END AS reclamada
       FROM promocion p
       LEFT JOIN cliente_promocion cp 
         ON cp.promocion_idpromocion = p.idpromocion
        AND cp.idcliente = ?
       WHERE p.eliminado = 0`,
      [idCliente]
    );

    if (!promociones.length) {
      return res.status(404).json({ message: 'No se encontraron promociones' });
    }

    // Aquí igual puedes traer imágenes/QRs como ya lo hacías
    const results = await Promise.all(
      promociones.map(async promocion => {
        const [imagenes] = await connection.promise().query(
          `SELECT idimagen, url, public_id 
           FROM imagen 
           WHERE promocion_idpromocion = ?`,
          [promocion.idpromocion]
        );

        return {
          ...promocion,
          imagenes: imagenes.map(img => ({
            id: img.idimagen,
            url: img.url,
            public_id: img.public_id
          }))
        };
      })
    );

    return res.status(200).json(results);
  } catch (error) {
    console.error('Error al consultar promociones:', error);
    return res.status(500).json({ message: 'Error al consultar promociones' });
  }
}







    };
};