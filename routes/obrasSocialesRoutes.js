const express = require('express');
const router = express.Router();
const obrasSocialesController = require('../controllers/obrasSocialesController');

// Get all obras sociales
router.get('/', obrasSocialesController.getAll);

// Get obra social by ID
router.get('/:id', obrasSocialesController.getById);

// Create new obra social
router.post('/', obrasSocialesController.create);

// Update obra social
router.put('/:id', obrasSocialesController.update);

// Delete obra social
router.delete('/:id', obrasSocialesController.delete);

module.exports = router;
