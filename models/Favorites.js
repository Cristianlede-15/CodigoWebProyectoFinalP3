const { DataTypes } = require('sequelize');
const sequelize = require('../config/AppDbContext');

const Favorites = sequelize.define('Favorites', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    business_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'favorites',
    timestamps: true,
    freezeTableName: true
});

module.exports = Favorites;