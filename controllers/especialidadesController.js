const pool = require('../config/database');

exports.getAll = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query(
            `SELECT id, nombre, descripcion, activo
             FROM especialidades
             WHERE activo = 1`
        );
        connection.release();
        res.status(200).json({ success: true, data: rows, message: 'Especialidades retrieved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error retrieving especialidades', error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        const [rows] = await connection.query(
            `SELECT id, nombre, descripcion, activo
             FROM especialidades
             WHERE id = ? AND activo = 1`,
            [id]
        );
        connection.release();
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Especialidad not found' });
        }
        res.status(200).json({ success: true, data: rows[0], message: 'Especialidad retrieved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error retrieving especialidad', error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        if (!nombre) {
            return res.status(400).json({ success: false, message: 'nombre is required' });
        }
        const connection = await pool.getConnection();
        const [existingNombre] = await connection.query(
            'SELECT id FROM especialidades WHERE nombre = ?',
            [nombre]
        );
        if (existingNombre.length > 0) {
            connection.release();
            return res.status(409).json({ success: false, message: 'Especialidad already exists' });
        }
        const [result] = await connection.query(
            'INSERT INTO especialidades (nombre, descripcion, activo) VALUES (?, ?, 1)',
            [nombre, descripcion || null]
        );
        connection.release();
        res.status(201).json({ success: true, data: { id: result.insertId, nombre, descripcion, activo: 1 }, message: 'Especialidad created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error creating especialidad', error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;
        const connection = await pool.getConnection();
        const [existing] = await connection.query(
            'SELECT id FROM especialidades WHERE id = ? AND activo = 1',
            [id]
        );
        if (existing.length === 0) {
            connection.release();
            return res.status(404).json({ success: false, message: 'Especialidad not found' });
        }
        await connection.query(
            'UPDATE especialidades SET nombre = ?, descripcion = ? WHERE id = ?',
            [nombre, descripcion, id]
        );
        connection.release();
        res.status(200).json({ success: true, data: { id: parseInt(id), nombre, descripcion, activo: 1 }, message: 'Especialidad updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error updating especialidad', error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        const [existing] = await connection.query(
            'SELECT id FROM especialidades WHERE id = ? AND activo = 1',
            [id]
        );
        if (existing.length === 0) {
            connection.release();
            return res.status(404).json({ success: false, message: 'Especialidad not found' });
        }
        await connection.query('UPDATE especialidades SET activo = 0 WHERE id = ?', [id]);
        connection.release();
        res.status(200).json({ success: true, message: 'Especialidad deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error deleting especialidad', error: error.message });
    }
};
