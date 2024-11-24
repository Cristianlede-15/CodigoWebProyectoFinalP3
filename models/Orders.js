// models/Orders.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/AppDbContext');
const Business = require('./Business');

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
    }
}, {
    tableName: 'orders',
    timestamps: true,
    freezeTableName: true
});



module.exports = Orders;