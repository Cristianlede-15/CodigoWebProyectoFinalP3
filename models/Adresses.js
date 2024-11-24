const { DataTypes } = require('sequelize');
const sequelize = require('../config/AppDbContext');

const Addresses = sequelize.define('Addresses', {
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'addresses',
    timestamps: true,
    freezeTableName: true
});

module.exports = Addresses;