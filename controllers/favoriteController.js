// controllers/favoriteController.js

const Users = require('../models/Users');
const Business = require('../models/Business');
const Favorites = require('../models/Favorites');

exports.markAsFavorite = async (req, res) => {
    const user_id = req.session.user.id;
    const { business_id } = req.body;

    try {
        // Verificar si ya está marcado como favorito para evitar duplicados
        const existingFavorite = await Favorites.findOne({
            where: { user_id, business_id }
        });

        if (!existingFavorite) {
            await Favorites.create({ user_id, business_id });
            console.log(`Usuario ${user_id} marcó el comercio ${business_id} como favorito.`);
        }

        res.redirect(`/user/comercio/${business_id}`);
    } catch (error) {
        console.error('Error al marcar como favorito:', error);
        res.status(500).send('Error al marcar como favorito');
    }
};

exports.removeFavorite = async (req, res) => {
    const user_id = req.session.user.id;
    const { business_id } = req.body;

    try {
        const favorite = await Favorites.findOne({
            where: { user_id, business_id }
        });

        if (favorite) {
            await favorite.destroy();
            console.log(`Usuario ${user_id} eliminó el comercio ${business_id} de favoritos.`);
        }

        res.redirect(`/user/comercio/${business_id}`);
    } catch (error) {
        console.error('Error al eliminar favorito:', error);
        res.status(500).send('Error al eliminar favorito');
    }
};

// Obtener y mostrar los favoritos del usuario
exports.getUserFavorites = async (req, res) => {
    const user_id = req.session.user.id;
    try {
        const user = await Users.findByPk(user_id, {
            include: [{
                model: Business,
                as: 'favoriteBusinesses',
                attributes: ['id', 'business_name', 'logo']
            }]
        });

        if (!user) {
            console.log('Usuario no encontrado');
            return res.status(404).send('Usuario no encontrado');
        }

        console.log('Favoritos obtenidos:', user.favoriteBusinesses);

        res.render('clienteViews/favoritos', { user: req.session.user, favorites: user.favoriteBusinesses });
    } catch (error) {
        console.error('Error al obtener favoritos:', error);
        res.status(500).send('Error al obtener favoritos');
    }
};