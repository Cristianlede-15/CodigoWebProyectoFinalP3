// models/Orders.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/AppDbContext');

const Orders = sequelize.define('Orders', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'in_process', 'completed'),
        defaultValue: 'pending',
        allowNull: false
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
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'orders',
    timestamps: true,
    freezeTableName: true
});

module.exports = Orders;