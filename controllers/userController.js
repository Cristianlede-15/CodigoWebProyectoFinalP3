const User = require('../models/Users');
const Order = require('../models/Orders');
const Business = require('../models/Business');
const BusinessType = require('../models/BusinessTypes');
const { Op } = require('sequelize');
const Favorites = require('../models/Favorites'); // Ajusta la ruta según sea necesario
const Categories = require('../models/Categories');
const Products = require('../models/Product');



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
    const user_id = req.session.user.id;

    try {
        const businesses = await Business.findAll({
            where: { business_type_id: typeId },
            attributes: ['id', 'business_name', 'logo']
        });

        // Obtener los IDs de los negocios favoritos
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

        res.render('clienteViews/comercio', {
            business,
            categories,
            isFavorite
        });
    } catch (error) {
        console.error('Error al obtener detalles del negocio:', error);
        res.status(500).send('Error al obtener detalles del negocio');
    }
};