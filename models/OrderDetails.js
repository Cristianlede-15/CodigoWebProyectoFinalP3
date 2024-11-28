// models/OrderDetails.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/AppDbContext');

const OrderDetails = sequelize.define('OrderDetails', {
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    },
    // Campos de claves foráneas
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'order_details',
    timestamps: true,
    freezeTableName: true
});

module.exports = OrderDetails;