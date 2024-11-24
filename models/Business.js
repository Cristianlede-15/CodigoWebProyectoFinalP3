// models/Business.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/AppDbContext');

const Business = sequelize.define('Business', {
    business_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    logo: {
        type: DataTypes.STRING(255)
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    opening_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    closing_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false // Por defecto inactivo hasta activar por correo
    },
    password: { // Campo password
        type: DataTypes.STRING,
        allowNull: false
    },
    activation_token: { // Campo para el token de activación
        type: DataTypes.STRING,
        allowNull: true
    },
    activation_token_expires: { // Campo para la expiración del token
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'business',
    timestamps: true,
    freezeTableName: true
});

module.exports = Business;