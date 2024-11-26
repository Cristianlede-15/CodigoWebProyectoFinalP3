// routes/cartRoutes.js

const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');

// Ruta para agregar al carrito
router.post('/cart/add', isAuthenticated, hasRole('client'), cartController.addToCart);

// Ruta para realizar el pago
router.post('/cart/checkout', isAuthenticated, hasRole('client'), cartController.checkout);

module.exports = router;