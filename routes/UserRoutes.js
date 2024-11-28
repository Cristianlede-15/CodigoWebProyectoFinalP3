const express = require('express');
const router = express.Router();
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');
const businessesController = require('../controllers/businessesController');
const userController = require('../controllers/userController');

// Ruta para la página de inicio del cliente
router.get('/home', isAuthenticated, hasRole('client'), userController.getBusinessTypes);


// Ruta para el perfil del usuario
router.get('/perfil', isAuthenticated, hasRole('client'), (req, res) => {
    res.render('clienteViews/perfil', { user: req.session.user });
});

// Ruta para los pedidos del usuario
router.get('/pedidos', isAuthenticated, hasRole('client'), (req, res) => {
    res.render('clienteViews/pedidos', { user: req.session.user });
});

// Ruta para las direcciones del usuario
router.get('/direcciones', isAuthenticated, hasRole('client'), (req, res) => {
    res.render('clienteViews/direcciones', { user: req.session.user });
});


// Ruta para los favoritos del usuario
router.get('/favoritos', isAuthenticated, hasRole('client'), (req, res) => {
    res.render('clienteViews/favoritos', { user: req.session.user });
});

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