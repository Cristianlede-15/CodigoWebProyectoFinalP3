// controllers/favoriteController.js

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