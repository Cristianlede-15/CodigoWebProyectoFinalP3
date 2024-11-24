const express = require('express');
const router = express.Router();
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');
const businessesController = require('../controllers/businessesController');

// Ruta para la página de inicio del cliente
router.get('/home', isAuthenticated, hasRole('client'), async (req, res) => {
    try {
        const businesses = await businessesController.getBusinesses();
        res.render('clienteViews/home', { user: req.session.user, businesses });
    } catch (error) {
        console.error('Error fetching businesses:', error);
        res.status(500).send('Error fetching businesses');
    }
});

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

module.exports = router;