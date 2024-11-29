// routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const { getDashboardMetrics } = require('../controllers/orderController');
const { getUsersByRole, getUsersByRoleWithOrders } = require('../controllers/userController');
const { getBusinessesWithOrders, toggleBusinessStatus } = require('../controllers/businessesController'); // Correct import
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');
const { createAdmin } = require('../controllers/authController');
const BusinessTypes = require('../models/BusinessTypes');
const Configuracion = require('../models/Configuracion');
const adminController = require('../controllers/adminController');
const Users = require('../models/Users');
const Business = require('../models/Business');
const authController = require('../controllers/authController');
const orderController = require('../controllers/orderController');
const upload = require('../config/multerConfig');
const businessesController = require('../controllers/businessesController');

// Ruta para /admin/dashboard
router.get('/dashboard', isAuthenticated, hasRole('admin'), getDashboardMetrics);

// Ruta para /admin/clientes
router.get('/clientes', isAuthenticated, hasRole('admin'), async (req, res) => {
    try {
        const clientes = await getUsersByRoleWithOrders('client');
        res.render('adminViews/clientes', { clientes });
    } catch (error) {
        console.error('Error fetching clientes:', error);
        res.status(500).send('Error fetching clientes');
    }
});

// Ruta para activar/inactivar cliente
router.post('/clientes/:id/toggle', isAuthenticated, hasRole('admin'), adminController.toggleCliente);


// Ruta para /admin/delivery
router.get('/delivery', isAuthenticated, hasRole('admin'), async (req, res) => {
    try {
        const deliveries = await getUsersByRole('delivery');
        console.log(deliveries);
        res.render('adminViews/delivery', { deliveries });
    } catch (error) {
        console.error('Error fetching deliveries:', error);
        res.status(500).send('Error fetching deliveries');
    }
});

// Ruta para activar/inactivar delivery
router.post('/delivery/:id/toggle', isAuthenticated, hasRole('admin'), async (req, res) => {
    try {
        const delivery = await Users.findByPk(req.params.id); // Correct: 'Users'
        if (delivery) {
            delivery.is_active = !delivery.is_active;
            await delivery.save();
        }
        res.redirect('/admin/delivery');
    } catch (error) {
        console.error('Error toggling delivery:', error);
        res.status(500).send('Error toggling delivery');
    }
});

// Ruta para /admin/comercios
router.get('/comercios', isAuthenticated, hasRole('admin'), async (req, res) => {
    try {
        const comercios = await getBusinessesWithOrders();
        console.log('Comercios fetched:', comercios); // Logging
        res.render('adminViews/comercios', { comercios });
    } catch (error) {
        console.error('Error fetching comercios:', error);
        res.status(500).send('Error fetching comercios');
    }
});

// Ruta para activar/inactivar comercio
router.post('/comercios/:id/toggle', isAuthenticated, hasRole('admin'), toggleBusinessStatus);

router.get('/auth/registerBusiness', async (req, res) => {
    try {
        const tiposComercios = await BusinessTypes.findAll();
        res.render('loginViews/registerBusiness', { tiposComercios });
    } catch (error) {
        console.error('Error fetching tipos de comercios:', error);
        res.status(500).send('Error fetching tipos de comercios');
    }
});

// Ruta para manejar el registro de comercios
router.post('/auth/registerBusiness', upload.single('logo'), authController.registerBusiness);

// En adminRoutes.js
// routes/adminRoutes.js

router.get('/administradores', isAuthenticated, hasRole('admin'), async (req, res) => {
    try {
        const administradores = await Users.findAll({ where: { role: 'admin' } });
        res.render('adminViews/administradores', { administradores, currentUser: req.user });
    } catch (error) {
        console.error('Error fetching administradores:', error);
        res.status(500).send('Error fetching administradores');
    }
});

// Ruta para /admin/tipos_comercios
router.get('/tipos_comercios', isAuthenticated, hasRole('admin'), async (req, res) => {
    try {
        const tiposComercios = await BusinessTypes.findAll();
        res.render('adminViews/tipos_Comercios', { tiposComercios });
    } catch (error) {
        console.error('Error fetching tipos de comercios:', error);
        res.status(500).send('Error fetching tipos de comercios');
    }
});

// Ruta para crear un nuevo administrador
router.post('/administradores/crear', isAuthenticated, hasRole('admin'), createAdmin);
router.get('/administradores/crear', isAuthenticated, hasRole('admin'), (req, res) => {
    res.render('adminViews/crearAdministrador');
});

// Ruta para /admin/configuracion
router.get('/configuracion', isAuthenticated, hasRole('admin'), adminController.mostrarConfiguracion);

// Ruta para editar configuración
router.get('/configuracion/editar', isAuthenticated, hasRole('admin'), adminController.editarConfiguracion);
router.post('/configuracion/editar', isAuthenticated, hasRole('admin'), adminController.guardarConfiguracion);


// routes/adminRoutes.js

// routes/adminRoutes.js

// adminRoutes.js

router.get('/administradores', isAuthenticated, hasRole('admin'), async (req, res) => {
    try {
        const administradores = await Users.findAll({ where: { role: 'admin' } });
        res.render('adminViews/administradores', {
            administradores,
            currentUser: req.user, // Pass currentUser to the template
        });
    } catch (error) {
        console.error('Error fetching administradores:', error);
        res.status(500).send('Error fetching administradores');
    }
});
// Ruta para activar administrador
router.get('/administradores/activar/:id', isAuthenticated, hasRole('admin'), adminController.activarAdmin);

// Ruta para inactivar administrador
router.get('/administradores/inactivar/:id', isAuthenticated, hasRole('admin'), adminController.inactivarAdmin);

// Ruta para mostrar formulario de edición
router.get('/administradores/editar/:id', isAuthenticated, hasRole('admin'), adminController.mostrarEditarAdmin);

// Ruta para procesar edición de administrador
router.post('/administradores/editar/:id', isAuthenticated, hasRole('admin'), adminController.editarAdmin);





// Ruta para mostrar el formulario de creación de tipo de comercio
router.get('/tipos_comercios/nuevo', isAuthenticated, hasRole('admin'), businessesController.renderCreateBusinessTypeForm);

// Ruta para manejar la creación de un nuevo tipo de comercio
router.post('/tipos_comercios/nuevo', isAuthenticated, hasRole('admin'), upload.single('icon'), businessesController.createBusinessType);

// Ruta para mostrar el formulario de edición de tipo de comercio
router.get('/tipos_comercios/editar/:id', isAuthenticated, hasRole('admin'), businessesController.renderEditBusinessTypeForm);

// Ruta para manejar la edición de un tipo de comercio
router.post('/tipos_comercios/editar/:id', isAuthenticated, hasRole('admin'), upload.single('icon'), businessesController.editBusinessType);

// Ruta para manejar la eliminación de un tipo de comercio
router.post('/tipos_comercios/eliminar/:id', isAuthenticated, hasRole('admin'), businessesController.deleteBusinessType);


router.post('/logout', authController.logout);
router.get('/logout', authController.logout);



module.exports = router;