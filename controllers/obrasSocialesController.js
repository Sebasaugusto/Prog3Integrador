const pool = require('../config/database');

exports.getAll = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query(
            `SELECT id, nombre, codigo, porcentaje_descuento, activo
             FROM obras_sociales
             WHERE activo = 1`
        );
        connection.release();
        res.status(200).json({ success: true, data: rows, message: 'Obras sociales retrieved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error retrieving obras sociales', error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        const [rows] = await connection.query(
            `SELECT id, nombre, codigo, porcentaje_descuento, activo
             FROM obras_sociales
             WHERE id = ? AND activo = 1`,
            [id]
        );
        connection.release();
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Obra social not found' });
        }
        res.status(200).json({ success: true, data: rows[0], message: 'Obra social retrieved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error retrieving obra social', error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { nombre, codigo, porcentaje_descuento } = req.body;
        if (!nombre || !codigo) {
            return res.status(400).json({ success: false, message: 'nombre and codigo are required' });
        }
        const connection = await pool.getConnection();
        const [existingCodigo] = await connection.query(
            'SELECT id FROM obras_sociales WHERE codigo = ?',
            [codigo]
        );
        if (existingCodigo.length > 0) {
            connection.release();
            return res.status(409).json({ success: false, message: 'Código already exists' });
        }
        const [result] = await connection.query(
            'INSERT INTO obras_sociales (nombre, codigo, porcentaje_descuento, activo) VALUES (?, ?, ?, 1)',
            [nombre, codigo, porcentaje_descuento || 0]
        );
        connection.release();
        res.status(201).json({ success: true, data: { id: result.insertId, nombre, codigo, porcentaje_descuento: porcentaje_descuento || 0, activo: 1 }, message: 'Obra social created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error creating obra social', error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, codigo, porcentaje_descuento } = req.body;
        const connection = await pool.getConnection();
        const [existing] = await connection.query(
            'SELECT id FROM obras_sociales WHERE id = ? AND activo = 1',
            [id]
        );
        if (existing.length === 0) {
            connection.release();
            return res.status(404).json({ success: false, message: 'Obra social not found' });
        }
        await connection.query(
            'UPDATE obras_sociales SET nombre = ?, codigo = ?, porcentaje_descuento = ? WHERE id = ?',
            [nombre, codigo, porcentaje_descuento, id]
        );
        connection.release();
        res.status(200).json({ success: true, data: { id: parseInt(id), nombre, codigo, porcentaje_descuento, activo: 1 }, message: 'Obra social updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error updating obra social', error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        const [existing] = await connection.query(
            'SELECT id FROM obras_sociales WHERE id = ? AND activo = 1',
            [id]
        );
        if (existing.length === 0) {
            connection.release();
            return res.status(404).json({ success: false, message: 'Obra social not found' });
        }
        await connection.query('UPDATE obras_sociales SET activo = 0 WHERE id = ?', [id]);
        connection.release();
        res.status(200).json({ success: true, message: 'Obra social deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error deleting obra social', error: error.message });
    }
};
