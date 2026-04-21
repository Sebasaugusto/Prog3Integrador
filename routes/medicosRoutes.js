const express = require('express');
const router = express.Router();
const medicosController = require('../controllers/medicosController');

// Get all medicos
router.get('/', medicosController.getAll);

// Get medico by ID
router.get('/:id', medicosController.getById);

// Create new medico
router.post('/', medicosController.create);

// Update medico
router.put('/:id', medicosController.update);

// Delete medico
router.delete('/:id', medicosController.delete);

module.exports = router;