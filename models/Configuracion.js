// models/Configuracion.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/AppDbContext');

const Configuracion = sequelize.define('Configuracion', {
    tax_rate: {
        type: DataTypes.INTEGER, // Changed from DECIMAL to INTEGER
        allowNull: false,
        defaultValue: 18 // Example default value
    },
}, {
    tableName: 'configuracion',
    timestamps: true,
    freezeTableName: true
});

module.exports = Configuracion;