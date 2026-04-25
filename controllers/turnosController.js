const pool = require('../config/database');

exports.getAll = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query(
            `SELECT t.id, t.medico_id, m.numero_colegiado, u.nombre as medico_nombre, 
                    t.paciente_id, p.numero_documento, u2.nombre as paciente_nombre,
                    t.especialidad_id, e.nombre as especialidad_nombre,
                    t.obra_social_id, o.nombre as obra_social_nombre,
                    t.fecha_hora, t.valor_total, t.estado, t.observaciones, t.activo
             FROM turnos t
             JOIN medicos m ON t.medico_id = m.id
             JOIN usuarios u ON m.usuario_id = u.id
             JOIN pacientes p ON t.paciente_id = p.id
             JOIN usuarios u2 ON p.usuario_id = u2.id
             JOIN especialidades e ON t.especialidad_id = e.id
             LEFT JOIN obras_sociales o ON t.obra_social_id = o.id
             WHERE t.activo = 1
             ORDER BY t.fecha_hora DESC`
        );
        connection.release();
        res.status(200).json({ success: true, data: rows, message: 'Turnos retrieved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error retrieving turnos', error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        const [rows] = await connection.query(
            `SELECT t.id, t.medico_id, m.numero_colegiado, u.nombre as medico_nombre, 
                    t.paciente_id, p.numero_documento, u2.nombre as paciente_nombre,
                    t.especialidad_id, e.nombre as especialidad_nombre,
                    t.obra_social_id, o.nombre as obra_social_nombre,
                    t.fecha_hora, t.valor_total, t.estado, t.observaciones, t.activo
             FROM turnos t
             JOIN medicos m ON t.medico_id = m.id
             JOIN usuarios u ON m.usuario_id = u.id
             JOIN pacientes p ON t.paciente_id = p.id
             JOIN usuarios u2 ON p.usuario_id = u2.id
             JOIN especialidades e ON t.especialidad_id = e.id
             LEFT JOIN obras_sociales o ON t.obra_social_id = o.id
             WHERE t.id = ? AND t.activo = 1`,
            [id]
        );
        connection.release();
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Turno not found' });
        }
        res.status(200).json({ success: true, data: rows[0], message: 'Turno retrieved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error retrieving turno', error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { medico_id, paciente_id, especialidad_id, obra_social_id, fecha_hora, observaciones } = req.body;
        if (!medico_id || !paciente_id || !especialidad_id || !fecha_hora) {
            return res.status(400).json({ success: false, message: 'medico_id, paciente_id, especialidad_id, and fecha_hora are required' });
        }
        const connection = await pool.getConnection();
        const [medico] = await connection.query('SELECT valor_consulta FROM medicos WHERE id = ? AND activo = 1', [medico_id]);
        if (medico.length === 0) {
            connection.release();
            return res.status(404).json({ success: false, message: 'Médico not found' });
        }
        const [paciente] = await connection.query('SELECT id FROM pacientes WHERE id = ? AND activo = 1', [paciente_id]);
        if (paciente.length === 0) {
            connection.release();
            return res.status(404).json({ success: false, message: 'Paciente not found' });
        }
        const [especialidad] = await connection.query('SELECT id FROM especialidades WHERE id = ? AND activo = 1', [especialidad_id]);
        if (especialidad.length === 0) {
            connection.release();
            return res.status(404).json({ success: false, message: 'Especialidad not found' });
        }
        let valor_total = medico[0].valor_consulta;
        if (obra_social_id) {
            const [obraSocial] = await connection.query('SELECT porcentaje_descuento FROM obras_sociales WHERE id = ? AND activo = 1', [obra_social_id]);
            if (obraSocial.length > 0) {
                valor_total = valor_total * (1 - obraSocial[0].porcentaje_descuento / 100);
            }
        }
        const [result] = await connection.query(
            'INSERT INTO turnos (medico_id, paciente_id, especialidad_id, obra_social_id, fecha_hora, valor_total, estado, observaciones, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
            [medico_id, paciente_id, especialidad_id, obra_social_id || null, fecha_hora, valor_total, 'Pendiente', observaciones || null]
        );
        connection.release();
        res.status(201).json({ success: true, data: { id: result.insertId, medico_id, paciente_id, especialidad_id, obra_social_id, fecha_hora, valor_total, estado: 'Pendiente', observaciones, activo: 1 }, message: 'Turno created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error creating turno', error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { medico_id, paciente_id, especialidad_id, obra_social_id, fecha_hora, estado, observaciones } = req.body;
        const connection = await pool.getConnection();
        const [existing] = await connection.query('SELECT id FROM turnos WHERE id = ? AND activo = 1', [id]);
        if (existing.length === 0) {
            connection.release();
            return res.status(404).json({ success: false, message: 'Turno not found' });
        }
        let valor_total = null;
        if (medico_id) {
            const [medico] = await connection.query('SELECT valor_consulta FROM medicos WHERE id = ? AND activo = 1', [medico_id]);
            if (medico.length === 0) {
                connection.release();
                return res.status(404).json({ success: false, message: 'Médico not found' });
            }
            valor_total = medico[0].valor_consulta;
            if (obra_social_id) {
                const [obraSocial] = await connection.query('SELECT porcentaje_descuento FROM obras_sociales WHERE id = ? AND activo = 1', [obra_social_id]);
                if (obraSocial.length > 0) {
                    valor_total = valor_total * (1 - obraSocial[0].porcentaje_descuento / 100);
                }
            }
        }
        await connection.query(
            'UPDATE turnos SET medico_id = ?, paciente_id = ?, especialidad_id = ?, obra_social_id = ?, fecha_hora = ?, valor_total = ?, estado = ?, observaciones = ? WHERE id = ?',
            [medico_id, paciente_id, especialidad_id, obra_social_id || null, fecha_hora, valor_total, estado, observaciones || null, id]
        );
        connection.release();
        res.status(200).json({ success: true, data: { id: parseInt(id), medico_id, paciente_id, especialidad_id, obra_social_id, fecha_hora, valor_total, estado, observaciones, activo: 1 }, message: 'Turno updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error updating turno', error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        const [existing] = await connection.query('SELECT id FROM turnos WHERE id = ? AND activo = 1', [id]);
        if (existing.length === 0) {
            connection.release();
            return res.status(404).json({ success: false, message: 'Turno not found' });
        }
        await connection.query('UPDATE turnos SET activo = 0 WHERE id = ?', [id]);
        connection.release();
        res.status(200).json({ success: true, message: 'Turno deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error deleting turno', error: error.message });
    }
};
