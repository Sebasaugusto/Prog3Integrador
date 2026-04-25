const pool = require('../config/database');

exports.getAll = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query(
            `SELECT p.id, u.nombre, u.email, p.fecha_nacimiento, p.numero_documento, p.activo
             FROM pacientes p
             JOIN usuarios u ON p.usuario_id = u.id
             WHERE p.activo = 1`
        );
        connection.release();
        res.status(200).json({ success: true, data: rows, message: 'Pacientes retrieved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error retrieving pacientes', error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        const [rows] = await connection.query(
            `SELECT p.id, u.nombre, u.email, p.fecha_nacimiento, p.numero_documento, p.activo
             FROM pacientes p
             JOIN usuarios u ON p.usuario_id = u.id
             WHERE p.id = ? AND p.activo = 1`,
            [id]
        );
        connection.release();
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Paciente not found' });
        }
        res.status(200).json({ success: true, data: rows[0], message: 'Paciente retrieved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error retrieving paciente', error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { nombre, email, fecha_nacimiento, numero_documento, contrasena } = req.body;
        if (!nombre || !email || !contrasena) {
            return res.status(400).json({ success: false, message: 'Nombre, email, and contrasena are required' });
        }
        const connection = await pool.getConnection();
        const [existingEmail] = await connection.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existingEmail.length > 0) {
            connection.release();
            return res.status(409).json({ success: false, message: 'Email already exists' });
        }
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(contrasena, 10);
        const [userResult] = await connection.query(
            'INSERT INTO usuarios (nombre, email, contrasena, rol_id, activo) VALUES (?, ?, ?, 2, 1)',
            [nombre, email, hashedPassword]
        );
        const [pacienteResult] = await connection.query(
            'INSERT INTO pacientes (usuario_id, fecha_nacimiento, numero_documento, activo) VALUES (?, ?, ?, 1)',
            [userResult.insertId, fecha_nacimiento || null, numero_documento || null]
        );
        connection.release();
        res.status(201).json({ success: true, data: { id: pacienteResult.insertId, usuario_id: userResult.insertId, nombre, email, fecha_nacimiento, numero_documento, activo: 1 }, message: 'Paciente created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error creating paciente', error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, fecha_nacimiento, numero_documento } = req.body;
        const connection = await pool.getConnection();
        const [existing] = await connection.query('SELECT usuario_id FROM pacientes WHERE id = ? AND activo = 1', [id]);
        if (existing.length === 0) {
            connection.release();
            return res.status(404).json({ success: false, message: 'Paciente not found' });
        }
        const usuarioId = existing[0].usuario_id;
        if (nombre || email) {
            await connection.query('UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?', [nombre, email, usuarioId]);
        }
        await connection.query('UPDATE pacientes SET fecha_nacimiento = ?, numero_documento = ? WHERE id = ?', [fecha_nacimiento, numero_documento, id]);
        connection.release();
        res.status(200).json({ success: true, data: { id: parseInt(id), nombre, email, fecha_nacimiento, numero_documento, activo: 1 }, message: 'Paciente updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error updating paciente', error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        const [existing] = await connection.query('SELECT id FROM pacientes WHERE id = ? AND activo = 1', [id]);
        if (existing.length === 0) {
            connection.release();
            return res.status(404).json({ success: false, message: 'Paciente not found' });
        }
        await connection.query('UPDATE pacientes SET activo = 0 WHERE id = ?', [id]);
        connection.release();
        res.status(200).json({ success: true, message: 'Paciente deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error deleting paciente', error: error.message });
    }
};
