const { DataTypes } = require('sequelize');
const sequelize = require('../config/AppDbContext');

const BusinessTypes = sequelize.define('BusinessTypes', {
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    icon: {
        type: DataTypes.STRING(255)
    }
}, {
    tableName: 'business_types',
    timestamps: true,
    freezeTableName: true
});

module.exports = BusinessTypes;