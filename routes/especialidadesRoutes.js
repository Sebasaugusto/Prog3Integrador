const express = require('express');
const router = express.Router();
const especialidadesController = require('../controllers/especialidadesController');

// Get all especialidades
router.get('/', especialidadesController.getAll);

// Get especialidad by ID
router.get('/:id', especialidadesController.getById);

// Create new especialidad
router.post('/', especialidadesController.create);

// Update especialidad
router.put('/:id', especialidadesController.update);

// Delete especialidad
router.delete('/:id', especialidadesController.delete);

module.exports = router;