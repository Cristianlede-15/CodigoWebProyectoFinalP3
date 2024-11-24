// controllers/businessesController.js

const Business = require('../models/Business');
const Order = require('../models/Orders');
const Category = require('../models/Categories');
const Product = require('../models/Product');


exports.getBusinesses = async () => {
    try {
        const businesses = await Business.findAll();
        return businesses;
    } catch (error) {
        console.error('Error fetching businesses:', error);
        throw error;
    }
};

exports.getBusinessesWithOrders = async () => {
    try {
        const businesses = await Business.findAll({
            include: [{
                model: Order,
                as: 'orders',
                attributes: ['id']
            }]
        });

        console.log('Businesses with orders:', businesses); // Logging

        return businesses.map(business => ({
            id: business.id,
            business_name: business.business_name,
            logo: business.logo,
            phone: business.phone,
            email: business.email,
            opening_time: business.opening_time,
            closing_time: business.closing_time,
            is_active: business.is_active,
            orderCount: business.orders.length
        }));
    } catch (error) {
        console.error('Error fetching businesses:', error);
        throw new Error('Error fetching businesses');
    }
};

// Toggle business active status
exports.toggleBusinessStatus = async (req, res) => {
    const businessId = req.params.id;
    try {
        const business = await Business.findByPk(businessId);
        if (!business) {
            return res.status(404).send('Business not found');
        }
        business.is_active = !business.is_active;
        await business.save();
        res.redirect('/admin/comercios');
    } catch (error) {
        console.error('Error toggling business status:', error);
        res.status(500).send('Internal Server Error');
    }
};



const BusinessType = require('../models/BusinessTypes');

exports.createBusinessType = async (req, res) => {
    const { name, description } = req.body;
    const icon = req.file ? `/ImagesRepo/${req.file.filename}` : null;
    try {
        await BusinessType.create({ name, description, icon });
        res.redirect('/admin/tipos_comercios');
    } catch (error) {
        console.error('Error creating business type:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.renderCreateBusinessTypeForm = (req, res) => {
    res.render('adminViews/createBusinessType');
};

exports.renderEditBusinessTypeForm = async (req, res) => {
    const { id } = req.params;
    try {
        const businessType = await BusinessType.findByPk(id);
        if (!businessType) {
            return res.status(404).send('Business type not found');
        }
        res.render('adminViews/editBusinessType', { businessType });
    } catch (error) {
        console.error('Error fetching business type:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.editBusinessType = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const icon = req.file ? `/ImagesRepo/${req.file.filename}` : null;
    try {
        const businessType = await BusinessType.findByPk(id);
        if (!businessType) {
            return res.status(404).send('Business type not found');
        }
        businessType.name = name;
        businessType.description = description;
        if (icon) {
            businessType.icon = icon;
        }
        await businessType.save();
        res.redirect('/admin/tipos_comercios');
    } catch (error) {
        console.error('Error updating business type:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.deleteBusinessType = async (req, res) => {
    const { id } = req.params;
    try {
        const businessType = await BusinessType.findByPk(id);
        if (!businessType) {
            return res.status(404).send('Business type not found');
        }
        await businessType.destroy();
        res.redirect('/admin/tipos_comercios');
    } catch (error) {
        console.error('Error deleting business type:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getOrdersForBusiness = async (businessId) => {
    try {
        // Verificar que el businessId no sea undefined
        if (!businessId) {
            throw new Error('businessId es indefinido');
        }

        // Obtener las órdenes asociadas al businessId
        const orders = await Order.findAll({
            where: { businessId },
            include: [{
                model: Business,
                as: 'business',
                attributes: ['business_name', 'logo']
            }],
            order: [['createdAt', 'DESC']]
        });

        return orders.map(order => ({
            id: order.id,
            status: order.status,
            total: order.total,
            createdAt: order.createdAt,
            businessName: order.business.business_name,
            businessLogo: order.business.logo,
            productCount: order.products ? order.products.length : 0 // Asegúrate de tener una asociación con productos
        }));
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw new Error('Error fetching orders');
    }
};


exports.getCategoriesForBusiness = async (businessId) => {
    try {
        const categories = await Category.findAll({
            where: { business_id: businessId }, // Updated key
            include: [{
                model: Product,
                as: 'products', // Ensure this alias matches your association
                attributes: ['id']
            }]
        });

        return categories.map(category => ({
            id: category.id,
            name: category.name,
            description: category.description,
            productCount: category.products.length // Updated to match alias
        }));
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw new Error('Error fetching categories');
    }
};

exports.createCategory = async (req, res) => {
    const { name, description } = req.body;
    const businessId = req.session.user.businessId; // Asegúrate de que este campo exista en la sesión

    if (!businessId) {
        return res.status(400).send('ID de negocio no encontrado en la sesión.');
    }

    try {
        await Category.create({ name, description, business_id: businessId });
        res.redirect('/business/categorias');
    } catch (error) {
        console.error('Error al crear la categoría:', error);
        res.status(500).send('Error Interno del Servidor');
    }
};

exports.getProducts = async (req, res) => {
    const businessId = req.session.user.businessId;
    try {
        const products = await Product.findAll({
            where: { business_id: businessId },
            include: [{
                model: Category,
                as: 'category',
                attributes: ['name']
            }]
        });
        res.render('comerciosViews/productos', { user: req.session.user, products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Internal Server Error');
    }
};

// controllers/businessesController.js

exports.renderCreateProductForm = async (req, res) => {
    const businessId = req.session.user.businessId;

    if (!businessId) {
        return res.status(400).send('ID de negocio no encontrado en la sesión.');
    }

    try {
        const categories = await Category.findAll({
            where: { business_id: businessId }
        });

        res.render('comerciosViews/crearProducto', { 
            user: req.session.user, 
            categories 
        });
    } catch (error) {
        console.error('Error al obtener categorías para crear producto:', error);
        res.status(500).send('Error Interno del Servidor');
    }
};

exports.renderEditProductForm = async (req, res) => {
    const { id } = req.params;
    const businessId = req.session.user.businessId;
    try {
        const product = await Product.findOne({
            where: { id, business_id: businessId },
            include: [{ model: Category, as: 'category' }]
        });
        if (!product) {
            return res.status(404).send('Producto no encontrado');
        }
        const categories = await Category.findAll({ where: { business_id: businessId } });
        res.render('comerciosViews/editarProducto', { user: req.session.user, product, categories });
    } catch (error) {
        console.error('Error fetching product for edit:', error);
        res.status(500).send('Internal Server Error');
    }
};

// controllers/businessesController.js
exports.createProduct = async (req, res) => {
    const { name, price, category_id } = req.body;
    const businessId = req.session.user.businessId;

    if (!businessId) {
        return res.status(400).send('ID de negocio no encontrado en la sesión.');
    }

    try {
        await Product.create({
            name,
            price,
            category_id,
            business_id: businessId
        });

        res.redirect('/business/productos');
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).send('Error Interno del Servidor');
    }
};

exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, price, category_id } = req.body;
    const businessId = req.session.user.businessId;

    try {
        const product = await Product.findOne({ where: { id, business_id: businessId } });
        if (!product) {
            return res.status(404).send('Producto no encontrado');
        }
        product.name = name;
        product.price = price;
        product.category_id = category_id;
        await product.save();
        res.redirect('/business/productos');
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        res.status(500).send('Error Interno del Servidor');
    }
};

exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    const businessId = req.session.user.businessId;

    try {
        const product = await Product.findOne({ where: { id, business_id: businessId } });
        if (!product) {
            return res.status(404).send('Producto no encontrado');
        }
        await product.destroy();
        res.redirect('/business/productos');
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        res.status(500).send('Error Interno del Servidor');
    }
};