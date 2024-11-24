const { DataTypes } = require('sequelize');
const sequelize = require('../config/AppDbContext');

const DeliveryStatus = sequelize.define('DeliveryStatus', {
    is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'delivery_status',
    timestamps: true,
    freezeTableName: true
});

module.exports = DeliveryStatus;