const { DataTypes } = require('sequelize');
const sequelize = require('../config/AppDbContext');

const Products = sequelize.define('Products', {
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    price: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    },
    image: {
        type: DataTypes.STRING(255)
    }
}, {
    tableName: 'products',
    timestamps: true,
    freezeTableName: true
});

module.exports = Products;