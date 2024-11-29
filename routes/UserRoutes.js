// FILE: UserRoutes.js
const express = require('express');
const router = express.Router();
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const favoriteController = require('../controllers/favoriteController'); // Importar el controlador de favoritos
const upload = require('../config/multerConfig'); // Asegúrate de la ruta correcta
const businessesController = require('../controllers/businessesController');

// Ruta para la página de inicio del cliente
router.get('/home', isAuthenticated, hasRole('client'), userController.getBusinessTypes);

// Ruta para mostrar el perfil del usuario
router.get('/perfil', isAuthenticated, hasRole('client'), userController.showProfile);

// Ruta para editar el perfil del usuario
router.post('/perfil/edit', isAuthenticated, hasRole('client'), upload.single('profile_image'), userController.updateProfile);

// Ruta para los pedidos del usuario
router.get('/pedidos', isAuthenticated, hasRole('client'), userController.getUserOrders);

// Ruta para los detalles de un pedido
router.get('/pedidos/:id', isAuthenticated, hasRole('client'), businessesController.getOrderDetail);


// Ruta para las direcciones del usuario
router.get('/direcciones', isAuthenticated, hasRole('client'), (req, res) => {
    res.render('clienteViews/direcciones', { user: req.session.user });
});

// Ruta para los favoritos del usuario
router.get('/favoritos', isAuthenticated, hasRole('client'), favoriteController.getUserFavorites);

// Ruta para cerrar sesión
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).send('Error al cerrar sesión.');
        }
        res.redirect('/auth/login');
    });
});

// Ruta para obtener los comercios por tipo
router.get('/comercios/:typeId', isAuthenticated, hasRole('client'), userController.getBusinessesByType);

// Ruta para buscar comercios por nombre
router.get('/comercios/:typeId/buscar', isAuthenticated, hasRole('client'), userController.searchBusinessesByName);

// Ruta para obtener los detalles de un comercio
router.get('/comercio/:business_id', userController.getBusinessDetails);

module.exports = router;