const User = require('../models/Users');
const Order = require('../models/Orders');
const Business = require('../models/Business');
const BusinessType = require('../models/BusinessTypes');
const { Op } = require('sequelize');
const Favorites = require('../models/Favorites'); // Ajusta la ruta según sea necesario
const Categories = require('../models/Categories');
const Products = require('../models/Product');
const Configuracion = require('../models/Configuracion');
const Address = require('../models/Adresses'); // Ajusta la ruta según sea necesario
const Product = require('../models/Product');
const Orders = require('../models/Orders');
const path = require('path');
const fs = require('fs');
const OrderDetails = require('../models/OrderDetails');
const DeliveryStatus = require('../models/DeliveryStatus');



// Controlador para obtener entregas (usuarios con rol 'delivery')
exports.getDeliveries = async (req, res) => {
    try {
        const deliveries = await User.findAll({ where: { role: 'delivery' } });
        res.render('adminViews/delivery', { deliveries });
    } catch (error) {
        console.error('Error fetching deliveries:', error);
        res.status(500).send('Error fetching deliveries');
    }
};

exports.getUsersByRole = async (role) => {
    try {
        return await User.findAll({ where: { role } });
    } catch (error) {
        console.error(`Error fetching users by role: ${role}`, error);
        throw new Error(`Error fetching users by role: ${role}`);
    }
};

exports.getUsersByRoleWithOrders = async (role) => {
    try {
        const users = await User.findAll({
            where: { role },
            include: [{
                model: Order,
                as: 'orders', // Asegúrate de que el alias coincida
                attributes: ['id']
            }]
        });

        return users.map(user => ({
            ...user.toJSON(),
            orderCount: user.orders.length
        }));
    } catch (error) {
        console.error(`Error fetching users by role: ${role}`, error);
        throw new Error(`Error fetching users by role: ${role}`);
    }
};

exports.getBusinessesWithOrders = async () => {
    try {
        const businesses = await Business.findAll({
            include: [{
                model: Order,
                as: 'orders',
                attributes: ['id']
            }, {
                model: User,
                attributes: ['first_name', 'last_name', 'email', 'phone'],
                where: { role: 'business' }
            }]
        });

        return businesses.map(business => ({
            ...business.toJSON(),
            orderCount: business.orders.length
        }));
    } catch (error) {
        console.error('Error fetching businesses:', error);
        throw new Error('Error fetching businesses');
    }
};

// Función para obtener todos los tipos de comercios
exports.getBusinessTypes = async (req, res) => {
    try {
        const businessTypes = await BusinessType.findAll();
        res.render('clienteViews/home', { user: req.session.user, businessTypes });
    } catch (error) {
        console.error('Error fetching business types:', error);
        res.status(500).send('Error fetching business types');
    }
};

// Función para obtener los comercios por tipo
exports.getBusinessesByType = async (req, res) => {
    const { typeId } = req.params;
    const user_id = req.session.user ? req.session.user.id : null;

    try {
        // Verificar si el user_id está disponible
        if (!user_id) {
            return res.status(401).send('Usuario no autenticado.');
        }

        // Recuperar los comercios filtrados por tipo y activos
        const businesses = await Business.findAll({
            where: { 
                business_type_id: typeId,
                is_active: true
            },
            attributes: ['id', 'business_name', 'logo']
        });

        console.log('Comercios recuperados:', businesses);

        // Obtener los IDs de los negocios favoritos del usuario
        const favoriteBusinesses = await Favorites.findAll({
            where: { user_id },
            attributes: ['business_id']
        });
        const favoriteBusinessIds = favoriteBusinesses.map(fav => fav.business_id);

        res.render('clienteViews/comercios', {
            businesses,
            typeId,
            favoriteBusinessIds
        });
    } catch (error) {
        console.error('Error al obtener los negocios:', error);
        res.status(500).send('Error al obtener los negocios');
    }
};

// Función para buscar comercios por nombre
exports.searchBusinessesByName = async (req, res) => {
    const { typeId } = req.params;
    const { nombre } = req.query;
    const user_id = req.session.user.id;

    try {
        // Buscar negocios que coincidan con el nombre y tipo
        const businesses = await Business.findAll({
            where: {
                business_type_id: typeId,
                business_name: {
                    [Op.like]: `%${nombre}%`
                }
            },
            attributes: ['id', 'business_name', 'logo']
        });

        // Obtener los IDs de los negocios favoritos del usuario
        const favoriteBusinesses = await Favorites.findAll({
            where: { user_id },
            attributes: ['business_id']
        });
        const favoriteBusinessIds = favoriteBusinesses.map(fav => fav.business_id);

        // Renderizar la vista pasando los datos necesarios
        res.render('clienteViews/comercios', {
            businesses,
            typeId,
            favoriteBusinessIds
        });
    } catch (error) {
        console.error('Error al buscar negocios por nombre:', error);
        res.status(500).send('Error al buscar negocios por nombre');
    }
};

// Función para obtener los detalles de un comercio
exports.getBusinessDetails = async (req, res) => {
    const { business_id } = req.params;
    const user_id = req.session.user.id;
    const cart = req.session.cart || { items: [], total: 0 };

    try {
        const business = await Business.findByPk(business_id, {
            attributes: ['id', 'business_name', 'logo', 'phone', 'email', 'opening_time', 'closing_time', 'business_type_id']
        });

        if (!business) {
            return res.status(404).send('Comercio no encontrado');
        }

        // Obtener las categorías y sus productos del negocio
        const categories = await Categories.findAll({
            where: { business_id: business.id },
            include: [{
                model: Products,
                as: 'products'
            }]
        });

        // Verificar si es favorito
        const favorite = await Favorites.findOne({
            where: { user_id, business_id: business.id }
        });

        const isFavorite = !!favorite;

        // Obtener la configuración de ITBIS
        const configuracion = await Configuracion.findOne();
        const taxRate = configuracion ? configuracion.tax_rate : 0;

        res.render('clienteViews/comercio', {
            business,
            categories,
            isFavorite,
            cart,
            taxRate
        });
    } catch (error) {
        console.error('Error al obtener detalles del negocio:', error);
        res.status(500).send('Error al obtener detalles del negocio');
    }
};

exports.selectAddress = async (req, res) => {
    const user_id = req.session.user.id;
    const cart = req.session.cart || { items: [], total: 0 };

    try {
        const addresses = await Address.findAll({ where: { user_id } });
        const business = await Business.findByPk(req.session.business_id, {
            attributes: ['id', 'business_name', 'logo']
        });

        if (!business) {
            return res.status(404).send('Comercio no encontrado');
        }

        // Obtener la configuración de ITBIS
        const configuracion = await Configuracion.findOne();
        const taxRate = configuracion ? configuracion.tax_rate : 0;

        res.render('clienteViews/seleccionarDireccion', {
            addresses,
            business,
            cart,
            taxRate
        });
    } catch (error) {
        console.error('Error al obtener direcciones:', error);
        res.status(500).send('Error al obtener direcciones');
    }
};

exports.getUserAddresses = async (req, res) => {
    const userId = req.session.user.id;

    try {
        const addresses = await Address.findAll({
            where: { user_id: userId },
            attributes: ['id', 'name', 'description']
        });

        res.render('clienteViews/direcciones', {
            addresses
        });
    } catch (error) {
        console.error('Error al obtener las direcciones del usuario:', error);
        res.status(500).send('Error al obtener las direcciones del usuario');
    }
};

// Agregar una nueva dirección
exports.addAddress = async (req, res) => {
    const userId = req.session.user.id;
    const { name, description } = req.body;

    try {
        await Address.create({
            user_id: userId,
            name,
            description
        });

        res.redirect('/user/direcciones');
    } catch (error) {
        console.error('Error al agregar la dirección:', error);
        res.status(500).send('Error al agregar la dirección');
    }
};

// Eliminar una dirección
exports.deleteAddress = async (req, res) => {
    const userId = req.session.user.id;
    const addressId = req.params.id;

    try {
        const address = await Address.findOne({
            where: { id: addressId, user_id: userId }
        });

        if (!address) {
            return res.status(404).send('Dirección no encontrada');
        }

        await address.destroy();
        res.redirect('/user/direcciones');
    } catch (error) {
        console.error('Error al eliminar la dirección:', error);
        res.status(500).send('Error al eliminar la dirección');
    }
};

// Obtener la página para editar una dirección
exports.editAddressPage = async (req, res) => {
    const userId = req.session.user.id;
    const addressId = req.params.id;

    try {
        const address = await Address.findOne({
            where: { id: addressId, user_id: userId }
        });

        if (!address) {
            return res.status(404).send('Dirección no encontrada');
        }

        res.render('clienteViews/editarDireccion', {
            address
        });
    } catch (error) {
        console.error('Error al obtener la dirección para editar:', error);
        res.status(500).send('Error al obtener la dirección para editar');
    }
};

// Actualizar una dirección
exports.updateAddress = async (req, res) => {
    const userId = req.session.user.id;
    const addressId = req.params.id;
    const { name, description } = req.body;

    try {
        const address = await Address.findOne({
            where: { id: addressId, user_id: userId }
        });

        if (!address) {
            return res.status(404).send('Dirección no encontrada');
        }

        await address.update({ name, description });
        res.redirect('/user/direcciones');
    } catch (error) {
        console.error('Error al actualizar la dirección:', error);
        res.status(500).send('Error al actualizar la dirección');
    }
};

// Mostrar el formulario de edición de perfil
exports.showProfile = async (req, res) => {
    const userId = req.session.user.id;
    try {
        const user = await User.findByPk(userId);
        res.render('clienteViews/perfil', { user });
    } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error);
        res.status(500).send('Error al obtener el perfil del usuario');
    }
};

// controllers/userController.js

exports.showDeliveryProfile = async (req, res) => {
    const userId = req.session.user.id;
    try {
        const user = await User.findByPk(userId);
        res.render('deliveryViews/perfil', { user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).send('Error fetching user profile');
    }
};

// Actualizar la información del perfil del usuario
exports.updateProfile = async (req, res) => {
    const userId = req.session.user.id;
    const { first_name, last_name, phone } = req.body;
    let profile_image = req.session.user.profile_image; // Default to existing image

    // Handle uploaded profile image
    if (req.file) {
        profile_image = req.file.filename; // Ensure the path matches your setup
    }

    try {
        // Update the user in the database
        await User.update(
            { first_name, last_name, phone, profile_image },
            { where: { id: userId } }
        );

        // Fetch the updated user data
        const updatedUser = await User.findByPk(userId);

        // Update the session with the latest user data
        req.session.user = {
            id: updatedUser.id,
            nombre: updatedUser.first_name, // Map correctly
            email: updatedUser.email,
            role: updatedUser.role,
            profile_image: updatedUser.profile_image // Add if needed
        };

        console.log('Updated Session User:', req.session.user); // Debug statement

        // Redirect to the profile page
        res.redirect('/delivery/perfil');
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).send('Error updating user profile');
    }
};

// Obtener todos los pedidos del usuario
exports.getUserOrders = async (req, res) => {
    const userId = req.session.user.id;
    try {
        const orders = await Order.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Business,
                    as: 'business',
                    attributes: ['business_name', 'logo'] // Incluye 'logo' aquí
                },
                {
                    model: Product,
                    as: 'products',
                    through: { attributes: [] },
                    attributes: ['name', 'price', 'image']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.render('clienteViews/pedidos', { user: req.session.user, orders });
    } catch (error) {
        console.error('Error al obtener los pedidos del usuario:', error);
        res.status(500).send('Error al obtener los pedidos del usuario');
    }
};

// Obtener detalles de un pedido específico
// controllers/userController.js
// Obtener detalles de un pedido específico
exports.getOrderDetails = async (req, res) => {
    const userId = req.session.user.id;
    const orderId = parseInt(req.params.id, 10); // Asegurar que orderId es un número

    console.log(`Buscando Pedido ID: ${orderId} para Usuario ID: ${userId}`);

    try {
        const order = await Order.findOne({
            where: {
                id: orderId,
                user_id: userId
            },
            include: [
                {
                    model: Business,
                    as: 'business',
                    attributes: ['id', 'business_name', 'logo']
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
            console.log(`Pedido con ID ${orderId} no encontrado para el usuario ${userId}.`);
            return res.status(404).send('Order not found');
        }

        console.log('Pedido encontrado:', order);
        res.render('clienteViews/detallePedido', { order, user: req.session.user, total: order.total });
    } catch (error) {
        console.error('Error al obtener el detalle del pedido:', error);
        res.status(500).send('Error interno del servidor');
    }
};


exports.getAssignedOrders = async (req, res) => {
    const userId = req.session.user.id;
    try {
        const orders = await Order.findAll({
            where: { delivery_id: userId },
            include: [
                {
                    model: Business,
                    as: 'business',
                    attributes: ['business_name', 'logo']
                },
                {
                    model: Product,
                    as: 'products',
                    attributes: ['id']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.render('deliveryViews/home', { user: req.session.user, orders });
    } catch (error) {
        console.error('Error fetching assigned orders:', error);
        res.status(500).send('Error fetching assigned orders');
    }
};

exports.getOrderDetails = async (req, res) => {
    const userId = req.session.user.id;
    const orderId = req.params.id;
    try {
        const order = await Orders.findOne({
            where: { id: orderId, delivery_id: userId },
            include: [
                {
                    model: Business,
                    as: 'business',
                    attributes: ['business_name', 'logo']
                },
                {
                    model: Product,
                    as: 'products',
                    attributes: ['name', 'price', 'image']
                },
                {
                    model: Address,
                    as: 'address',
                    attributes: ['description']
                }
            ]
        });
        if (!order) {
            return res.status(404).send('Order not found');
        }
        res.render('deliveryViews/orderDetails', { user: req.session.user, order });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).send('Error fetching order details');
    }
};

exports.completeOrder = async (req, res) => {
    const userId = req.session.user.id;
    const orderId = req.params.id;
    try {
        const order = await Orders.findOne({ where: { id: orderId, delivery_id: userId } });
        if (!order) {
            return res.status(404).send('Order not found');
        }
        order.status = 'completed';
        await order.save();

        const deliveryStatus = await DeliveryStatus.findOne({ where: { user_id: userId } });
        if (deliveryStatus) {
            deliveryStatus.is_available = true;
            await deliveryStatus.save();
        }

        res.redirect(`/delivery/order/${orderId}`);
    } catch (error) {
        console.error('Error completing order:', error);
        res.status(500).send('Error completing order');
    }
};