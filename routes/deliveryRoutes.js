const express = require('express');
const router = express.Router();
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');

router.get('/home', isAuthenticated, hasRole('delivery'), (req, res) => {
    res.render('deliveryViews/home', { user: req.session.user });
});

router.get('/perfil', isAuthenticated, hasRole('delivery'), (req, res) => {
    res.render('deliveryViews/perfil', { user: req.session.user });
});

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