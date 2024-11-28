// models/Orders.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/AppDbContext');

const Orders = sequelize.define('Orders', {
    status: {
        type: DataTypes.ENUM('pending', 'in_process', 'completed'),
        defaultValue: 'pending'
    },
    subtotal: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    },
    tax_rate: {
        type: DataTypes.DECIMAL(5,2),
        allowNull: false
    },
    total: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    },
    // Campos de claves foráneas
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    business_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    address_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    delivery_id: {
        type: DataTypes.INTEGER,
        allowNull: true // Puede ser null si aún no se asigna repartidor
    }
}, {
    tableName: 'orders',
    timestamps: true,
    freezeTableName: true
});

module.exports = Orders;