// routes/businessRoutes.js

const express = require('express');
const router = express.Router();
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');
const businessesController = require('../controllers/businessesController');
const upload = require('../config/multerConfig');
const Category = require('../models/Categories');

// Ruta principal del negocio
router.get('/home', isAuthenticated, hasRole('business'), businessesController.getOrdersForBusiness);

// Ruta para obtener órdenes en formato JSON
router.get('/orders', isAuthenticated, hasRole('business'), async (req, res) => {
    const businessId = req.session.business_id; // Usar 'business_id' de la sesión
    console.log('businessId:', businessId); // Log para depuración

    try {
        const orders = await businessesController.getOrdersForBusiness(req, res);
        // La función getOrdersForBusiness ya maneja la respuesta
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
});
// Ruta para el detalle del pedido
router.get('/orders/:id', isAuthenticated, hasRole('business'), businessesController.getOrderDetail);


// Ruta para asignar delivery a un pedido
router.post('/orders/:id/assign-delivery', isAuthenticated, hasRole('business'), businessesController.assignDelivery);


// Otras rutas protegidas para negocios
router.get('/perfil', businessesController.renderProfile);

// Ruta para actualizar el perfil del negocio
router.post('/perfil', upload.single('logo'), businessesController.updateProfile);

// Ruta para manejar productos
router.get('/productos', isAuthenticated, hasRole('business'), businessesController.getProducts);

// Ruta para renderizar el formulario de creación de producto
router.get('/productos/crear', isAuthenticated, hasRole('business'), businessesController.renderCreateProductForm);

// Ruta para crear un nuevo producto
router.post('/productos/crear', isAuthenticated, hasRole('business'), upload.single('image'), businessesController.createProduct);

// Ruta para renderizar el formulario de edición de producto
router.get('/productos/editar/:id', isAuthenticated, hasRole('business'), businessesController.renderEditProductForm);

// Ruta para actualizar un producto
router.post('/productos/editar/:id', isAuthenticated, hasRole('business'), businessesController.updateProduct);

// Ruta para eliminar un producto
router.post('/productos/eliminar/:id', isAuthenticated, hasRole('business'), businessesController.deleteProduct);

// Ruta para mantenimiento de categorías
router.get('/categorias', isAuthenticated, hasRole('business'), businessesController.getCategoriesForBusiness);

// Ruta para renderizar el formulario de creación de categoría
router.get('/categorias/crear', isAuthenticated, hasRole('business'), (req, res) => {
    res.render('comerciosViews/crearCategoria', { user: req.session.user });
});

// Ruta para crear una nueva categoría
router.post('/categorias/crear', isAuthenticated, hasRole('business'), businessesController.createCategory);

// Ruta para editar categoría
router.get('/categorias/editar/:id', isAuthenticated, hasRole('business'), async (req, res) => {
    try {
        const { id } = req.params;
        const businessId = req.session.business_id;
        const category = await Category.findOne({ where: { id, business_id: businessId } });
        
        if (!category) {
            return res.status(404).send('Categoría no encontrada');
        }
        
        res.render('comerciosViews/editarCategoria', { user: req.session.user, category });
    } catch (error) {
        console.error('Error fetching category for edit:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Ruta para actualizar una categoría existente
router.post('/categorias/editar/:id', isAuthenticated, hasRole('business'), async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        const category = await Category.findOne({ where: { id, business_id: req.session.business_id } });
        if (!category) {
            return res.status(404).send('Categoría no encontrada');
        }
        category.name = name;
        category.description = description;
        await category.save();
        res.redirect('/business/categorias');
    } catch (error) {
        console.error('Error editing category:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Ruta para eliminar categoría
router.post('/categorias/eliminar/:id', isAuthenticated, hasRole('business'), async (req, res) => {
    const { id } = req.params;
    try {
        const category = await Category.findOne({ where: { id, business_id: req.session.business_id } });
        if (!category) {
            return res.status(404).send('Categoría no encontrada');
        }
        await category.destroy();
        res.redirect('/business/categorias');
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).send('Internal Server Error');
    }
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