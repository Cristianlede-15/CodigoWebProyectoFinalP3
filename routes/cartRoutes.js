// routes/cartRoutes.js

const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const userController = require('../controllers/userController');
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');

// Ruta para agregar al carrito
router.post('/cart/add', isAuthenticated, hasRole('client'), cartController.addToCart);

// Ruta para realizar el pago
router.post('/cart/checkout', isAuthenticated, hasRole('client'), cartController.checkout);

// Ruta para eliminar del carrito
router.post('/cart/remove', isAuthenticated, hasRole('client'), cartController.removeFromCart);

// Ruta para seleccionar dirección
router.get('/checkout', isAuthenticated, hasRole('client'), userController.selectAddress);

router.post('/checkout', isAuthenticated, hasRole('client'), cartController.checkout);


// Rutas para direcciones
router.get('/user/direcciones', isAuthenticated, hasRole('client'), userController.getUserAddresses);
router.get('/user/direcciones/agregar', isAuthenticated, hasRole('client'), (req, res) => {
    res.render('clienteViews/agregarDireccion');
});
router.post('/user/direcciones/agregar', isAuthenticated, hasRole('client'), userController.addAddress);
router.get('/user/direcciones/editar/:id', isAuthenticated, hasRole('client'), userController.editAddressPage);
router.post('/user/direcciones/editar/:id', isAuthenticated, hasRole('client'), userController.updateAddress);
router.post('/user/direcciones/eliminar/:id', isAuthenticated, hasRole('client'), userController.deleteAddress);

module.exports = router;