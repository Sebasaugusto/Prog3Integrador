'use strict';

// Import mysql2 connection pool
const pool = require('../db'); // Adjust the path as necessary

// Get all especialidades
const getAll = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM especialidades');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get especialidad by ID
const getById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM especialidades WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Especialidad not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new especialidad
const create = async (req, res) => {
    const { name, description } = req.body; // Adjust fields as necessary
    try {
        const [result] = await pool.query('INSERT INTO especialidades (name, description) VALUES (?, ?)', [name, description]);
        res.status(201).json({ id: result.insertId, name, description });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update especialidad
const update = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body; // Adjust fields as necessary
    try {
        const [result] = await pool.query('UPDATE especialidades SET name = ?, description = ? WHERE id = ?', [name, description, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Especialidad not found' });
        }
        res.json({ id, name, description });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete especialidad
const deleteEspecialidad = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM especialidades WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Especialidad not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: deleteEspecialidad,
};
