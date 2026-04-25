const express = require('express');
const router = express.Router();
const turnosController = require('../controllers/turnosController');

// Get all turnos
router.get('/', turnosController.getAll);

// Get turno by ID
router.get('/:id', turnosController.getById);

// Create new turno
router.post('/', turnosController.create);

// Update turno
router.put('/:id', turnosController.update);

// Delete turno
router.delete('/:id', turnosController.delete);

module.exports = router;
