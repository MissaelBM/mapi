module.exports = (connection) => {
  return {
    consultar: async (req, res) => {
      try {
        const [rows] = await connection.promise().query(
          'SELECT * FROM tesoro WHERE eliminado = ?',
          [0]
        );
        res.status(200).json(rows);
      } catch (error) {
        console.error('Error al consultar tesoros:', error);
        res.status(500).json({ message: 'Error al consultar tesoros' });
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
        maximosusuarios,
        vigenciainicio,
        vigenciafin,
        tipo
      } = req.body;

      try {
        const [empresaResult] = await connection.promise().query(
          'SELECT idempresa FROM empresa WHERE idempresa = ?',
          [empresa_idempresa]
        );
        if (empresaResult.length === 0) {
          return res.status(400).json({ message: 'La empresa no existe' });
        }

        const [categoriaResult] = await connection.promise().query(
          'SELECT idcategoria FROM categoria WHERE idcategoria = ?',
          [categoria_idcategoria]
        );
        if (categoriaResult.length === 0) {
          return res.status(400).json({ message: 'La categoría no existe' });
        }

          const { lat, lng } = ubicacion;      
            const pointWKT = `POINT(${lng} ${lat})`;

        const [result] = await connection.promise().query(
          'INSERT INTO tesoro (empresa_idempresa, categoria_idcategoria, nombre, descripcion, ubicacion, maximosusuarios, vigenciainicio, vigenciafin, tipo, eliminado) VALUES (?, ?, ?, ?, ST_GeomFromText(?), ?, ?, ?, ?, ?)',
          [
            empresa_idempresa,
            categoria_idcategoria,
            nombre,
            descripcion,
            pointWKT,
            maximosusuarios,
            vigenciainicio,
            vigenciafin,
            tipo || 'Premio',
            0
          ]
        );

        res.status(201).json({ message: 'Tesoro creado', tesoroId: result.insertId });
      } catch (error) {
        console.error('Error al crear tesoro:', error);
        res.status(500).json({ message: 'Error al crear tesoro' });
      }
    },

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
