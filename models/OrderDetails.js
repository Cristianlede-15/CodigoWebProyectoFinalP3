const { DataTypes } = require('sequelize');
const sequelize = require('../config/AppDbContext');

const OrderDetails = sequelize.define('OrderDetails', {
    price: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    }
}, {
    tableName: 'order_details',
    timestamps: true,
    freezeTableName: true
});

module.exports = OrderDetails;