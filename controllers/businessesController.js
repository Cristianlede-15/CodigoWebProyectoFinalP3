// controllers/businessesController.js

const Business = require('../models/Business');
const Order = require('../models/Orders');
const Category = require('../models/Categories');
const Product = require('../models/Product');
const OrderDetails = require('../models/OrderDetails');
const Address = require('../models/Adresses');

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
    const businessId = req.session.business_id; // Actualizado para usar business_id directamente
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

// controllers/businessesController.js

exports.getOrdersForBusiness = async (req, res) => {
    console.log('Contenido de la sesión:', req.session); // Verifica la sesión
    const business_id = req.session.business_id; // Usar 'business_id'

    if (!business_id) {
        console.error('Business ID no encontrado en la sesión');
        return res.status(400).send('No se ha seleccionado un negocio.');
    }

    try {
        const orders = await Order.findAll({
            where: { business_id: business_id },
            include: [
                {
                    model: Business,
                    as: 'business',
                    attributes: ['business_name', 'logo']
                },
                {
                    model: OrderDetails,
                    as: 'orderDetails',
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['name', 'price']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        const formattedOrders = orders.map(order => ({
            id: order.id,
            status: order.status,
            subtotal: order.subtotal,
            tax_rate: order.tax_rate,
            total: order.total,
            createdAt: order.createdAt,
            businessName: order.business.business_name,
            businessLogo: order.business.logo,
            productCount: order.orderDetails ? order.orderDetails.length : 0
        }));

        res.render('comerciosViews/home', { orders: formattedOrders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).send('Error fetching orders');
    }
};

exports.getCategoriesForBusiness = async (req, res) => {
    try {
        console.log('Contenido de la sesión en getCategoriesForBusiness:', req.session);
        const business_id = req.session.business_id;

        if (!business_id) {
            console.error('business_id no está definido en la sesión.');
            return res.status(400).send('No se ha seleccionado un negocio.');
        }

        const categories = await Category.findAll({
            where: { business_id: business_id },
            include: [
                {
                    model: Product,
                    as: 'products',
                    attributes: ['id', 'name', 'price']
                }
            ]
        });

        const categoriesWithCount = categories.map(category => ({
            id: category.id,
            name: category.name,
            description: category.description,
            productCount: category.products.length
        }));

        res.render('comerciosViews/categorias', { categories: categoriesWithCount });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Error fetching categories');
    }
};

exports.createCategory = async (req, res) => {
    const { name, description } = req.body;
    const businessId = req.session.business_id; // Accede directamente a business_id

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
    const businessId = req.session.business_id; // Acceder correctamente
    if (!businessId) {
        console.error('Business ID no encontrado en la sesión.');
        return res.status(400).send('No se ha seleccionado un negocio.');
    }
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
    const businessId = req.session.business_id; // Actualizado para usar business_id directamente

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
    const businessId = req.session.business_id; // Actualizado para usar business_id directamente
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
    const { name, description, price, category_id } = req.body;
    const businessId = req.session.business_id;

    if (!businessId) {
        return res.status(400).send('ID de negocio no encontrado en la sesión.');
    }

    try {
        const image = req.file ? req.file.filename : null;

        await Product.create({
            name,
            description,
            price,
            category_id,
            business_id: businessId,
            image
        });

        res.redirect('/business/productos');
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).send('Error Interno del Servidor');
    }
};

// Asegúrate de que el método para renderizar el formulario de creación incluye las categorías
exports.renderCreateProductForm = async (req, res) => {
    const businessId = req.session.business_id;

    try {
        const categories = await Category.findAll({
            where: { business_id: businessId }
        });

        res.render('comerciosViews/crearProducto', { user: req.session.user, categories });
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).send('Error Interno del Servidor');
    }
};

exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, price, category_id } = req.body;
    const businessId = req.session.business_id; // Actualizado para usar business_id directamente

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
    const businessId = req.session.business_id; // Actualizado para usar business_id directamente

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


exports.updateProfile = async (req, res) => {
    const businessId = req.session.business_id; // Actualizado para usar business_id directamente
    const { business_name, address, phone, email } = req.body;

    try {
        const business = await Business.findByPk(businessId);
        if (!business) {
            return res.status(404).send('Negocio no encontrado');
        }

        business.business_name = business_name;
        business.address = address;
        business.phone = phone;
        business.email = email;

        await business.save();
        res.redirect('/business/perfil');
    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        res.status(500).send('Error Interno del Servidor');
    }
};

// controllers/businessesController.js

// controllers/businessesController.js

exports.getOrderDetail = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [
                {
                    model: Product,
                    as: 'products'
                },
                {
                    model: Business,
                    as: 'business',
                    attributes: ['business_name', 'logo']
                },
                {
                    model: OrderDetails,
                    as: 'orderDetails',
                    include: [{
                        model: Product,
                        as: 'product',
                        attributes: ['id', 'name', 'price', 'image']
                    }],
                    attributes: ['id', 'quantity', 'price']
                },
                {
                    model: Address,
                    as: 'address',
                    attributes: ['id', 'description']
                }
            ]
        });
        if (!order) {
            return res.status(404).send('Pedido no encontrado');
        }

        // Determinar la vista a renderizar en función de la ruta
        const view = req.path.includes('/business/') ? 'orderDetail' : 'clienteViews/detallePedido';
        res.render(view, { order });
    } catch (error) {
        console.error('Error obteniendo el detalle del pedido:', error);
        res.status(500).send('Error al obtener el detalle del pedido');
    }
};

exports.assignDelivery = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).send('Pedido no encontrado');
        }
        if (order.status !== 'pendiente') {
            return res.status(400).send('El pedido no está en estado pendiente');
        }
        // Aquí puedes agregar lógica para asignar un delivery específico
        order.status = 'en proceso';
        order.deliveryAssigned = true; // Asumiendo que tienes este campo
        await order.save();
        res.redirect(`/business/orders/${req.params.id}`);
    } catch (error) {
        console.error('Error asignando delivery:', error);
        res.status(500).send('Error al asignar delivery');
    }
};