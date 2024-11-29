const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../middleware/multerConfig'); // Asegúrate de que la ruta es correcta
const multer = require('multer'); // Añade esta línea

// Ruta para mostrar el formulario de inicio de sesión
router.get('/login', authController.showLoginPage);

// Ruta para manejar el envío del formulario de inicio de sesión
router.post('/login', authController.login);

// Ruta para cerrar sesión
router.post('/logout', authController.logout);
router.get('/logout', authController.logout);

// Ruta para mostrar el formulario de registro
router.get('/register', (req, res) => {
    res.render('loginViews/registro', { layout: false });
});

// Ruta para manejar el envío del formulario de registro
router.post('/register', upload.single('profile_image'), authController.register);

router.post('/registerBusiness', upload.single('logo'), authController.registerBusiness);

router.get('/registerBusiness', authController.getRegisterBusiness);

// Ruta para mostrar el formulario de recuperación de contraseña
router.get('/requestPasswordReset', (req, res) => {
    res.render('othersViews/restablecer_contrasena', { layout: false });
});

// Ruta para manejar el envío del formulario de recuperación de contraseña
router.post('/request-password-reset', authController.requestPasswordReset);

// Ruta para mostrar el formulario de restablecimiento de contraseña
router.get('/reset/:token', (req, res) => {
    const { token } = req.params;
    res.render('othersViews/reset_password', { token, layout: false });
});

// Ruta para manejar el envío del formulario de restablecimiento de contraseña
router.post('/reset-password', authController.resetPassword);

// Ruta para manejar la activación de la cuenta
router.get('/activateBusiness/:token', authController.activateBusinessAccount);

router.get('/activate-business/:token', authController.activateBusinessAccount);

router.get('/activate/:token', authController.activateAccount);

module.exports = router;