// models/DeliveryStatus.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/AppDbContext');

const DeliveryStatus = sequelize.define('DeliveryStatus', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
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
    tableName: 'delivery_status',
    timestamps: true,
    freezeTableName: true
});

module.exports = DeliveryStatus;