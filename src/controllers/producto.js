module.exports = (connection) => {
  return {
    consultar: async (req, res) => {
      try {
        const [rows] = await connection.promise().query(
          'SELECT * FROM producto WHERE eliminado = ?',
          [0]
        );
        res.status(200).json(rows);
      } catch (error) {
        console.error('Error al consultar productos:', error);
        res.status(500).json({ message: 'Error al consultar productos' });
      }
    },

    consultarId: async (req, res) => {
      const { id } = req.params;

      try {
        const [rows] = await connection.promise().query(
          'SELECT * FROM producto WHERE idproducto = ? AND eliminado = ?',
          [id, 0]
        );

        if (rows.length === 0) {
          return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.status(200).json(rows[0]);
      } catch (error) {
        console.error('Error al consultar producto por ID:', error);
        res.status(500).json({ message: 'Error al consultar producto' });
      }
    },

    crear: async (req, res) => {
      const {
        empresa_idempresa,
        categoria_idcategoria,
        nombre,
        descripcion,
        precio,
        idcreador,
        fechacreacion,
        disponible
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

        const [result] = await connection.promise().query(
          `INSERT INTO producto (
            empresa_idempresa, categoria_idcategoria, nombre, descripcion,
            precio, idcreador, fechacreacion, disponible, eliminado
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            empresa_idempresa,
            categoria_idcategoria,
            nombre || null,
            descripcion || null,
            precio || null,
            idcreador || null,
            fechacreacion || new Date(),
            disponible || 1,
            0
          ]
        );

        res.status(201).json({ message: 'Producto creado', id: result.insertId });
      } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ message: 'Error al crear producto' });
      }
    },

    actualizar: async (req, res) => {
      const { id } = req.params;
      const {
        empresa_idempresa,
        categoria_idcategoria,
        nombre,
        descripcion,
        precio,
        idcreador,
        fechaactualizacion,
        disponible
      } = req.body;

      try {
        let query = 'UPDATE producto SET ';
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

        if (precio !== undefined) {
          updates.push('precio = ?');
          params.push(precio);
        }

        if (idcreador !== undefined) {
          updates.push('idcreador = ?');
          params.push(idcreador);
        }

        if (fechaactualizacion !== undefined) {
          updates.push('fechaactualizacion = ?');
          params.push(fechaactualizacion);
        }

        if (disponible !== undefined) {
          updates.push('disponible = ?');
          params.push(disponible);
        }

        if (updates.length === 0) {
          return res.status(400).json({ message: 'Sin datos para actualizar' });
        }

        query += updates.join(', ') + ' WHERE idproducto = ?';
        params.push(id);

        const [result] = await connection.promise().query(query, params);

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.status(200).json({ message: 'Producto actualizado correctamente' });
      } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ message: 'Error al actualizar producto' });
      }
    },  eliminarProducto: async (req, res) => {
          const { id } = req.params;

          try {
            
              const [result] = await connection.promise().query(
                  'UPDATE producto SET eliminado = ? WHERE idproducto = ?',
                  [1, id]
              );

              if (result.affectedRows === 0) {
                  return res.status(404).json({ message: 'Producto no encontrado' });
              }

              res.status(200).json({ message: 'Producto eliminado lógicamente' });
          } catch (error) {
              console.error('Error:', error);
              res.status(500).json({ message: 'Error' });
          }
      }
  };
};
