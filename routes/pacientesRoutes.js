const express = require('express');
const router = express.Router();
const pacientesController = require('../controllers/pacientesController');

// Get all pacientes
router.get('/', pacientesController.getAll);

// Get paciente by ID
router.get('/:id', pacientesController.getById);

// Create new paciente
router.post('/', pacientesController.create);

// Update paciente
router.put('/:id', pacientesController.update);

// Delete paciente
router.delete('/:id', pacientesController.delete);

module.exports = router;
