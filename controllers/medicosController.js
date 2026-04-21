const pool = require('../config/database');

exports.getAll = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT m.id, u.nombre, u.email, m.numero_colegiado, m.valor_consulta, m.activo FROM medicos m JOIN usuarios u ON m.usuario_id = u.id WHERE m.activo = 1');
        connection.release();
        res.status(200).json({ success: true, data: rows, message: 'Médicos retrieved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error retrieving médicos', error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT m.id, u.nombre, u.email, m.numero_colegiado, m.valor_consulta, m.activo FROM medicos m JOIN usuarios u ON m.usuario_id = u.id WHERE m.id = ? AND m.activo = 1', [id]);
        connection.release();
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Médico not found' });
        }
        res.status(200).json({ success: true, data: rows[0], message: 'Médico retrieved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error retrieving médico', error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { nombre, email, numero_colegiado, valor_consulta, contrasena } = req.body;
        if (!nombre || !email || !numero_colegiado || !valor_consulta || !contrasena) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        const connection = await pool.getConnection();
        const [existingEmail] = await connection.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existingEmail.length > 0) {
            connection.release();
            return res.status(409).json({ success: false, message: 'Email already exists' });
        }
        const [existingColegiado] = await connection.query('SELECT id FROM medicos WHERE numero_colegiado = ?', [numero_colegiado]);
        if (existingColegiado.length > 0) {
            connection.release();
            return res.status(409).json({ success: false, message: 'Número de colegiado already exists' });
        }
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(contrasena, 10);
        const [userResult] = await connection.query('INSERT INTO usuarios (nombre, email, contrasena, rol_id, activo) VALUES (?, ?, ?, 1, 1)', [nombre, email, hashedPassword]);
        const [medicoResult] = await connection.query('INSERT INTO medicos (usuario_id, numero_colegiado, valor_consulta, activo) VALUES (?, ?, ?, 1)', [userResult.insertId, numero_colegiado, valor_consulta]);
        connection.release();
        res.status(201).json({ success: true, data: { id: medicoResult.insertId, usuario_id: userResult.insertId, nombre, email, numero_colegiado, valor_consulta, activo: 1 }, message: 'Médico created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error creating médico', error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, numero_colegiado, valor_consulta } = req.body;
        const connection = await pool.getConnection();
        const [existing] = await connection.query('SELECT usuario_id FROM medicos WHERE id = ? AND activo = 1', [id]);
        if (existing.length === 0) {
            connection.release();
            return res.status(404).json({ success: false, message: 'Médico not found' });
        }
        const usuarioId = existing[0].usuario_id;
        if (nombre || email) {
            await connection.query('UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?', [nombre, email, usuarioId]);
        }
        await connection.query('UPDATE medicos SET numero_colegiado = ?, valor_consulta = ? WHERE id = ?', [numero_colegiado, valor_consulta, id]);
        connection.release();
        res.status(200).json({ success: true, data: { id: parseInt(id), nombre, email, numero_colegiado, valor_consulta, activo: 1 }, message: 'Médico updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error updating médico', error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        const [existing] = await connection.query('SELECT id FROM medicos WHERE id = ? AND activo = 1', [id]);
        if (existing.length === 0) {
            connection.release();
            return res.status(404).json({ success: false, message: 'Médico not found' });
        }
        await connection.query('UPDATE medicos SET activo = 0 WHERE id = ?', [id]);
        connection.release();
        res.status(200).json({ success: true, message: 'Médico deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error deleting médico', error: error.message });
    }
};
