module.exports = (connection) => {
  return {
    consultar: async (req, res) => {
      try {
        const [rows] = await connection.promise().query(
          'SELECT * FROM cliente_tesoro WHERE eliminado = ?',
          [0]
        );
        res.status(200).json(rows);
      } catch (error) {
        console.error('Error al consultar cliente_tesoro:', error);
        res.status(500).json({ message: 'Error al consultar registros' });
      }
    },

    consultarId: async (req, res) => {
      const { id } = req.params;

      try {
        const [rows] = await connection.promise().query(
          'SELECT * FROM cliente_tesoro WHERE idcliente_tesoro = ? AND eliminado = ?',
          [id, 0]
        );

        if (rows.length === 0) {
          return res.status(404).json({ message: 'Registro no encontrado' });
        }

        res.status(200).json(rows[0]);
      } catch (error) {
        console.error('Error al consultar por ID:', error);
        res.status(500).json({ message: 'Error al consultar registro' });
      }
    },

    cliente_tesoro: async (req, res) => {
      const { cliente_idcliente, tesoro_idtesoro } = req.body;

      const [clienteResult] = await connection.promise().query(
          'SELECT idcliente FROM cliente WHERE idcliente = ?',
          [cliente_idcliente]
        );
        if (clienteResult.length === 0) {
          return res.status(400).json({ message: 'El cliente no existe' });
        }

        const [tesoroResult] = await connection.promise().query(
          'SELECT idtesoro FROM tesoro WHERE idtesoro = ?',
          [tesoro_idtesoro]
        );
        if (tesoroResult.length === 0) {
          return res.status(400).json({ message: 'El tesoro no existe' });
        }
      try {
        const [result] = await connection.promise().query(
          `INSERT INTO cliente_tesoro 
          (cliente_idcliente, tesoro_idtesoro, fechaencontrado, reclamado, fechareclamo, eliminado) 
          VALUES (?, ?, NOW(), 0, NULL, 0)`,
          [cliente_idcliente, tesoro_idtesoro]
        );

        res.status(201).json({ message: 'Tesoro registrado como encontrado', id: result.insertId });
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ message: 'El cliente ya encontró este tesoro previamente' });
        }
        console.error('Error al registrar:', error);
        res.status(500).json({ message: 'Error al registrar hallazgo del tesoro' });
      }
    },

    reclamar: async (req, res) => {
      const { cliente_idcliente, tesoro_idtesoro } = req.body;

      try {
        const [result] = await connection.promise().query(
          `UPDATE cliente_tesoro 
           SET reclamado = 1, fechareclamo = NOW()
           WHERE cliente_idcliente = ? AND tesoro_idtesoro = ? AND reclamado = 0`,
          [cliente_idcliente, tesoro_idtesoro]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Tesoro no encontrado o ya reclamado por el cliente' });
        }

        res.status(200).json({ message: 'Tesoro reclamado exitosamente' });
      } catch (error) {
        console.error('Error al reclamar tesoro:', error);
        res.status(500).json({ message: 'Error al reclamar tesoro' });
      }
    },actualizar: async (req, res) => {
      const { id } = req.params;
      const {
        cliente_idcliente,
        tesoro_idtesoro,
        fechaencontrado,
        reclamado,
        fechareclamo
      } = req.body;

      try {
        let query = 'UPDATE cliente_tesoro SET ';
        const updates = [];
        const params = [];

        if (cliente_idcliente !== undefined) {
          updates.push('cliente_idcliente = ?');
          params.push(cliente_idcliente);
        }

        if (tesoro_idtesoro !== undefined) {
          updates.push('tesoro_idtesoro = ?');
          params.push(tesoro_idtesoro);
        }

        if (fechaencontrado !== undefined) {
          updates.push('fechaencontrado = ?');
          params.push(fechaencontrado);
        }

        if (reclamado !== undefined) {
          updates.push('reclamado = ?');
          params.push(reclamado);
        }

        if (fechareclamo !== undefined) {
          updates.push('fechareclamo = ?');
          params.push(fechareclamo);
        }

        if (updates.length === 0) {
          return res.status(400).json({ message: 'Sin datos para actualizar' });
        }

        query += updates.join(', ') + ' WHERE idcliente_tesoro = ?';
        params.push(id);

        const [result] = await connection.promise().query(query, params);

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Registro no encontrado' });
        }

        res.status(200).json({ message: 'Registro actualizado correctamente' });
      } catch (error) {
        console.error('Error al actualizar registro:', error);
        res.status(500).json({ message: 'Error al actualizar registro' });
      }
    },
     eliminarClienteTesoro: async (req, res) => {
          const { id } = req.params;

          try {
            
              const [result] = await connection.promise().query(
                  'UPDATE cliente_tesoro SET eliminado = ? WHERE idtesoro = ?',
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
