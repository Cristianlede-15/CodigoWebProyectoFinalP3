// models/Categories.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/AppDbContext');
const Business = require('./Business');

const Categories = sequelize.define('Categories', {
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    business_id: { // Nuevo campo para la asociación
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'business', // Nombre de la tabla referenciada
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    }
}, {
    tableName: 'categories',
    timestamps: true,
    freezeTableName: true
});

// Asociación

module.exports = Categories;