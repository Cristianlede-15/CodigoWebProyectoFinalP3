const express = require('express');
const router = express.Router();
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

router.get('/home', isAuthenticated, hasRole('delivery'), userController.getAssignedOrders);

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

router.get('/order/:id', isAuthenticated, hasRole('delivery'), userController.getOrderDetails);
router.post('/order/:id/complete', isAuthenticated, hasRole('delivery'), userController.completeOrder);

module.exports = router;