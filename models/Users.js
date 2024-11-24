const { DataTypes } = require('sequelize');
const sequelize = require('../config/AppDbContext');

const Users = sequelize.define('Users', {
    email: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('client', 'delivery', 'business', 'admin'),
        allowNull: false
    },
    first_name: {
        type: DataTypes.STRING(100)
    },
    last_name: {
        type: DataTypes.STRING(100)
    },
    phone: {
        type: DataTypes.STRING(20)
    },
    profile_image: {
        type: DataTypes.STRING(255)
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    activation_token: {
        type: DataTypes.STRING(255)
    },
    password_reset_token: {
        type: DataTypes.STRING(255)
    },
    cedula: {
        type: DataTypes.STRING(20),
        allowNull: true
    }
}, {
    tableName: 'users',
    timestamps: true,
    freezeTableName: true
});

module.exports = Users;