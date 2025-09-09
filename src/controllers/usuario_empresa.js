module.exports = (connection) => {
    return{
         usuarioEmpresa: async (req, res) => {
        const { usuario_idusuario, empresa_idempresa, fechaasignacion } = req.body;

        try {
            // Verificar que el usuario existe
            const [usuarioResult] = await connection.promise().query(
                'SELECT idusuario FROM usuario WHERE idusuario = ?',
                [usuario_idusuario]
            );

            if (usuarioResult.length === 0) {
                return res.status(400).json({ message: 'El usuario especificado no existe' });
            }

            // Verificar que la empresa existe
            const [empresaResult] = await connection.promise().query(
                'SELECT idempresa FROM empresa WHERE idempresa = ?',
                [empresa_idempresa]
            );

            if (empresaResult.length === 0) {
                return res.status(400).json({ message: 'La empresa especificada no existe' });
            }

            // Insertar el registro
            const [result] = await connection.promise().query(
                'INSERT INTO usuario_empresa (usuario_idusuario, empresa_idempresa, fechaasignacion, eliminado) VALUES (?, ?, ?, ?)',
                [usuario_idusuario, empresa_idempresa, fechaasignacion, 0]
            );

            res.status(201).json({ 
                message: 'Usuario-Empresa registrado exitosamente', 
                usuarioEmpresaId: result.insertId 
            });
        } catch (error) {
            console.error('Error al registrar usuario-empresa:', error);
            res.status(500).json({ message: 'Error al registrar usuario-empresa' });
        }
    
    },consultar: async (req, res) => {
        try {
            const [result] = await connection.promise().query(`
                SELECT 
                    ue.idusuario_empresa,
                    ue.usuario_idusuario,
                    ue.empresa_idempresa,
                    ue.fechaasignacion,
                    u.nombre as nombre_usuario,
                    u.email as email_usuario,
                    e.nombre as nombre_empresa,
                    e.rfc as rfc_empresa
                FROM usuario_empresa ue
                LEFT JOIN usuario u ON ue.usuario_idusuario = u.idusuario
                LEFT JOIN empresa e ON ue.empresa_idempresa = e.idempresa
                WHERE ue.eliminado = 0
                ORDER BY ue.fechaasignacion DESC
            `);

            if (result.length === 0) {
                return res.status(404).json({ message: 'No se encontraron registros de usuario-empresa' });
            }

            res.status(200).json({
                message: 'Registros obtenidos exitosamente',
                data: result
            });
        } catch (error) {
            console.error('Error al obtener usuarios-empresas:', error);
            res.status(500).json({ message: 'Error al obtener usuarios-empresas' });
        }
    },consultarId: async (req, res) => {
        const { id } = req.params;

        try {
            const [result] = await connection.promise().query(`
                SELECT 
                    ue.idusuario_empresa,
                    ue.usuario_idusuario,
                    ue.empresa_idempresa,
                    ue.fechaasignacion,
                    u.nombre as nombre_usuario,
                    u.email as email_usuario,
                    e.nombre as nombre_empresa,
                    e.rfc as rfc_empresa
                FROM usuario_empresa ue
                LEFT JOIN usuario u ON ue.usuario_idusuario = u.idusuario
                LEFT JOIN empresa e ON ue.empresa_idempresa = e.idempresa
                WHERE ue.idusuario_empresa = ? AND ue.eliminado = 0
            `, [id]);

            if (result.length === 0) {
                return res.status(404).json({ message: 'Usuario-Empresa no encontrado' });
            }

            res.status(200).json({
                message: 'Usuario-Empresa obtenido exitosamente',
                data: result[0]
            });
        } catch (error) {
            console.error('Error al obtener usuario-empresa:', error);
            res.status(500).json({ message: 'Error al obtener usuario-empresa' });
        }
    },actualizarUsuarioEmpresa: async (req, res) => {
        const { id } = req.params;
        const { usuario_idusuario, empresa_idempresa, fechaasignacion } = req.body;

        try {
            let query = 'UPDATE usuario_empresa SET ';
            const updates = [];
            const params = [];

            if (usuario_idusuario !== undefined) {
                // Verificar que el usuario existe
                const [usuarioResult] = await connection.promise().query(
                    'SELECT idusuario FROM usuario WHERE idusuario = ?',
                    [usuario_idusuario]
                );

                if (usuarioResult.length === 0) {
                    return res.status(400).json({ message: 'El usuario especificado no existe' });
                }

                updates.push('usuario_idusuario = ?');
                params.push(usuario_idusuario);
            }

            if (empresa_idempresa !== undefined) {
                // Verificar que la empresa existe
                const [empresaResult] = await connection.promise().query(
                    'SELECT idempresa FROM empresa WHERE idempresa = ?',
                    [empresa_idempresa]
                );

                if (empresaResult.length === 0) {
                    return res.status(400).json({ message: 'La empresa especificada no existe' });
                }

                updates.push('empresa_idempresa = ?');
                params.push(empresa_idempresa);
            }

            if (fechaasignacion !== undefined) {
                updates.push('fechaasignacion = ?');
                params.push(fechaasignacion);
            }

            if (updates.length === 0) {
                return res.status(400).json({ message: 'Sin información para actualizar' });
            }

            query += updates.join(', ') + ' WHERE idusuario_empresa = ? AND eliminado = 0';
            params.push(id);

            const [result] = await connection.promise().query(query, params);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Usuario-Empresa no encontrado' });
            }

            res.status(200).json({ message: 'Usuario-Empresa actualizado exitosamente' });
        } catch (error) {
            console.error('Error al actualizar usuario-empresa:', error);
            res.status(500).json({ message: 'Error al actualizar usuario-empresa' });
        }
    }, eliminarUsuarioEmpresa: async (req, res) => {
        const { id } = req.params;

        try {
            const [result] = await connection.promise().query(
                'UPDATE usuario_empresa SET eliminado = ? WHERE idusuario_empresa = ?',
                [1, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Usuario-Empresa no encontrado' });
            }

            res.status(200).json({ message: 'Usuario-Empresa eliminado lógicamente' });
        } catch (error) {
            console.error('Error al eliminar usuario-empresa:', error);
            res.status(500).json({ message: 'Error al eliminar usuario-empresa' });
        }
    }
}
}