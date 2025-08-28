const { v4: uuidv4 } = require('uuid');
const QRCode         = require('qrcode');

module.exports = (connection) => {
  return {
      consultar: async (req, res) => {
    try {
      const [tesoros] = await connection.promise().query(
        `SELECT 
           idtesoro,
           empresa_idempresa,
           categoria_idcategoria,
           nombre,
           descripcion,
           ST_AsText(ubicacion)   AS ubicacion,
           maximousuarios,
           vigenciainicio,
           vigenciafin,
           tipo
         FROM tesoro
         WHERE eliminado = 0`
      );

      if (!tesoros.length) {
        return res.status(404).json({ message: 'No se encontraron tesoros' });
      }

     
      const resultados = await Promise.all(
        tesoros.map(async tesoro => {
       
          const [qrRows] = await connection.promise().query(
            `SELECT 
               token,
               fechaactivacion,
               fechaexpiracion,
               usado
             FROM qr_tesoro
             WHERE tesoro_idtesoro = ?`,
            [tesoro.idtesoro]
          );

         
          const qrItems = await Promise.all(
            qrRows.map(async qr => {
              const url = `${process.env.URL_API}/api/tesoro/reclamar/${qr.token}`;
              const imageBase64 = await QRCode.toDataURL(url);
              return {
                token: qr.token,
                url,
                imageBase64,
                fechaactivacion: qr.fechaactivacion,
                fechaexpiracion: qr.fechaexpiracion,
                usado: qr.usado === 1
              };
            })
          );

          return {
            ...tesoro,
            qr: qrItems
          };
        })
      );

      
      return res.status(200).json(resultados);

    } catch (error) {
      console.error('Error al consultar tesoros:', error);
      return res.status(500).json({ message: 'Error al consultar tesoros' });
    }
      },

    consultarId: async (req, res) => {
      const { id } = req.params;

      try {
        const [rows] = await connection.promise().query(
          'SELECT * FROM tesoro WHERE idtesoro = ? AND eliminado = ?',
          [id, 0]
        );

        if (rows.length === 0) {
          return res.status(404).json({ message: 'Tesoro no encontrado' });
        }

        res.status(200).json(rows[0]);
      } catch (error) {
        console.error('Error al consultar tesoro por ID:', error);
        res.status(500).json({ message: 'Error al consultar tesoro' });
      }
    },

   crearTesoro: async (req, res) => {
  const {
    empresa_idempresa,
    categoria_idcategoria,
    nombre,
    descripcion,
    ubicacion,        
    maximousuarios,   
    vigenciainicio,   
    vigenciafin,      
    tipo             
  } = req.body;

 
  const conn = await connection.promise().getConnection();
  try {
    await conn.beginTransaction();

 
    const [emp] = await conn.query(
      'SELECT 1 FROM empresa WHERE idempresa = ?',
      [empresa_idempresa]
    );
    if (!emp.length) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ message: 'La empresa no existe' });
    }

    const [cat] = await conn.query(
      'SELECT 1 FROM categoria WHERE idcategoria = ?',
      [categoria_idcategoria]
    );
    if (!cat.length) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ message: 'La categoría no existe' });
    }

    const { lat, lng } = ubicacion;
    const pointWKT = `POINT(${lng} ${lat})`;

    const [tesoroRes] = await conn.query(
      `INSERT INTO tesoro 
         (empresa_idempresa, categoria_idcategoria, nombre, descripcion,
          ubicacion, maximousuarios, vigenciainicio, vigenciafin, tipo, eliminado)
       VALUES (?, ?, ?, ?, ST_GeomFromText(?), ?, ?, ?, ?, 0)`,
      [
        empresa_idempresa,
        categoria_idcategoria,
        nombre,
        descripcion,
        pointWKT,
        maximousuarios,
        vigenciainicio,
        vigenciafin,
        tipo || 'Premio'
      ]
    );
    const tesoroId = tesoroRes.insertId;

    const tokens = Array.from({ length: maximousuarios }, () => uuidv4());

    
    const qrValues = tokens.map(token => [
      tesoroId,
      token,
      vigenciainicio,
      vigenciafin,
      0             
    ]);
    await conn.query(
      `INSERT INTO qr_tesoro 
         (tesoro_idtesoro, token, fechacreacion, fechaexpiracion, usado)
       VALUES ?`,
      [qrValues]
    );

    const urls  = tokens.map(t => `${process.env.URL_API}/api/tesoro/reclamar/${t}`);
    const imagesBase64 = await Promise.all(urls.map(u => QRCode.toDataURL(u)));

    const qrItems = tokens.map((token, i) => ({
      token,
      url: urls[i],
      imageBase64: imagesBase64[i]
    }));

    await conn.commit();
    conn.release();

    return res.status(201).json({
      message: 'Tesoro creado exitosamente',
      tesoroId,
      qr: qrItems
    });

  } catch (error) {
    console.error('Error al crear tesoro:', error);
    await conn.rollback();
    conn.release();
    return res.status(500).json({ message: 'Error al crear tesoro' });
  }
}
,

    actualizarTesoro: async (req, res) => {
      const { id } = req.params;
      const {
        empresa_idempresa,
        categoria_idcategoria,
        nombre,
        descripcion,
        ubicacion,
        maximosusuarios,
        vigenciainicio,
        vigenciafin,
        tipo
      } = req.body;

      try {
        let query = 'UPDATE tesoro SET ';
        const updates = [];
        const params = [];

        if (empresa_idempresa !== undefined) {
          updates.push('empresa_idempresa = ?');
          params.push(empresa_idempresa);
        }

        if (categoria_idcategoria !== undefined) {
          updates.push('categoria_idcategoria = ?');
          params.push(categoria_idcategoria);
        }

        if (nombre !== undefined) {
          updates.push('nombre = ?');
          params.push(nombre);
        }

        if (descripcion !== undefined) {
          updates.push('descripcion = ?');
          params.push(descripcion);
        }

        if (ubicacion !== undefined) {
          updates.push('ubicacion = POINT(?, ?)');
          params.push(ubicacion.x, ubicacion.y);
        }

        if (maximosusuarios !== undefined) {
          updates.push('maximosusuarios = ?');
          params.push(maximosusuarios);
        }

        if (vigenciainicio !== undefined) {
          updates.push('vigenciainicio = ?');
          params.push(vigenciainicio);
        }

        if (vigenciafin !== undefined) {
          updates.push('vigenciafin = ?');
          params.push(vigenciafin);
        }

        if (tipo !== undefined) {
          updates.push('tipo = ?');
          params.push(tipo);
        }

        if (updates.length === 0) {
          return res.status(400).json({ message: 'Sin datos para actualizar' });
        }

        query += updates.join(', ') + ' WHERE idtesoro = ?';
        params.push(id);

        const [result] = await connection.promise().query(query, params);

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Tesoro no encontrado' });
        }

        res.status(200).json({ message: 'Tesoro actualizado correctamente' });
      } catch (error) {
        console.error('Error al actualizar tesoro:', error);
        res.status(500).json({ message: 'Error al actualizar tesoro' });
      }
    },  eliminarTesoro: async (req, res) => {
          const { id } = req.params;

          try {
            
              const [result] = await connection.promise().query(
                  'UPDATE teosoro SET eliminado = ? WHERE idtesoro = ?',
                  [1, id]
              );

              if (result.affectedRows === 0) {
                  return res.status(404).json({ message: 'Tesoro no encontrado' });
              }

              res.status(200).json({ message: 'Tesoro eliminado lógicamente' });
          } catch (error) {
              console.error('Error:', error);
              res.status(500).json({ message: 'Error' });
          }
      }
  };
};
