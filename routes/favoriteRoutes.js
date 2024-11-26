// routes/favoriteRoutes.js

const express = require('express');
const router = express.Router();
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');
const favoriteController = require('../controllers/favoriteController');

// Ruta para marcar un comercio como favorito
router.post('/marcar', isAuthenticated, hasRole('client'), favoriteController.markAsFavorite);

// Ruta para eliminar un comercio de favoritos
router.post('/eliminar', isAuthenticated, hasRole('client'), favoriteController.removeFavorite);

module.exports = router;