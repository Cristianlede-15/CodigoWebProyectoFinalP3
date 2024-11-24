const { DataTypes } = require('sequelize');
const sequelize = require('../config/AppDbContext');

const Favorites = sequelize.define('Favorites', {}, {
    tableName: 'favorites',
    timestamps: true,
    freezeTableName: true
});

module.exports = Favorites;