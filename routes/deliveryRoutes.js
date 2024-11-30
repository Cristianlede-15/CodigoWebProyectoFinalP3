// routes/deliveryRoutes.js

const express = require('express');
const router = express.Router();
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const upload = require('../config/multerConfig'); // Ensure multer is configured

// Route to display assigned orders
router.get('/home', isAuthenticated, hasRole('delivery'), userController.getAssignedOrders);

// Route to display the profile form
router.get('/perfil', isAuthenticated, hasRole('delivery'), (req, res, next) => {
    console.log('Session Data:', req.session.user); // Debug statement
    next();
}, userController.showDeliveryProfile);

// Route to handle profile updates
router.post('/perfil', isAuthenticated, hasRole('delivery'), upload.single('profile_image'), userController.updateProfile);

// Route to handle logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).send('Error al cerrar sesión.');
        }
        res.redirect('/auth/login');
    });
});

// Route to get order details
router.get('/order/:id', isAuthenticated, hasRole('delivery'), userController.getOrderDetails);

// Route to complete an order
router.post('/order/:id/complete', isAuthenticated, hasRole('delivery'), userController.completeOrder);

module.exports = router;