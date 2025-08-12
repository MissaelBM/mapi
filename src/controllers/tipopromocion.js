module.exports = (connection) => {
  return {
    consultar: async (req, res) => {
      try {
        const [rows] = await connection.promise().query(
          'SELECT * FROM tipopromocion WHERE eliminado = ?',
          [0]
        );
        res.status(200).json(rows);
      } catch (error) {
        console.error('Error al consultar tipos de promoción:', error);
        res.status(500).json({ message: 'Error al consultar tipos de promoción' });
      }
    },

    consultarId: async (req, res) => {
      const { id } = req.params;

      try {
        const [rows] = await connection.promise().query(
          'SELECT * FROM tipopromocion WHERE idtipopromocion = ? AND eliminado = ?',
          [id, 0]
        );

        if (rows.length === 0) {
          return res.status(404).json({ message: 'Tipo de promoción no encontrado' });
        }

        res.status(200).json(rows[0]);
      } catch (error) {
        console.error('Error al consultar tipo de promoción por ID:', error);
        res.status(500).json({ message: 'Error al consultar tipo de promoción' });
      }
    },

    crear: async (req, res) => {
      const { nombre, idcreador, fechacreacion } = req.body;

      try {
        const [result] = await connection.promise().query(
          'INSERT INTO tipopromocion (nombre, idcreador, fechacreacion, eliminado) VALUES (?, ?, ?, ?)',
          [nombre || null, idcreador || null, fechacreacion || new Date(), 0]
        );

        res.status(201).json({ message: 'Tipo de promoción creado', id: result.insertId });
      } catch (error) {
        console.error('Error al crear tipo de promoción:', error);
        res.status(500).json({ message: 'Error al crear tipo de promoción' });
      }
    },

    actualizar: async (req, res) => {
      const { id } = req.params;
      const { nombre, idcreador, fechaactualizacion } = req.body;

      try {
        let query = 'UPDATE tipopromocion SET ';
        const updates = [];
        const params = [];

        if (nombre !== undefined) {
          updates.push('nombre = ?');
          params.push(nombre);
        }

        if (idcreador !== undefined) {
          updates.push('idcreador = ?');
          params.push(idcreador);
        }

        if (fechaactualizacion !== undefined) {
          updates.push('fechaactualizacion = ?');
          params.push(fechaactualizacion);
        }

        if (updates.length === 0) {
          return res.status(400).json({ message: 'Sin datos para actualizar' });
        }

        query += updates.join(', ') + ' WHERE idtipopromocion = ?';
        params.push(id);

        const [result] = await connection.promise().query(query, params);

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Tipo de promoción no encontrado' });
        }

        res.status(200).json({ message: 'Tipo de promoción actualizado correctamente' });
      } catch (error) {
        console.error('Error al actualizar tipo de promoción:', error);
        res.status(500).json({ message: 'Error al actualizar tipo de promoción' });
      }
    }, eliminarTipoPromocion: async (req, res) => {
          const { id } = req.params;

          try {
            
              const [result] = await connection.promise().query(
                  'UPDATE tipopromocion SET eliminado = ? WHERE idtipopromocion = ?',
                  [1, id]
              );

              if (result.affectedRows === 0) {
                  return res.status(404).json({ message: 'Tipo promocion no encontrado' });
              }

              res.status(200).json({ message: 'Tipo promocion eliminado lógicamente' });
          } catch (error) {
              console.error('Error:', error);
              res.status(500).json({ message: 'Error' });
          }
      }
  };
};
