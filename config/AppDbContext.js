const Sequelize = require('sequelize');
const path = require('path');

const Connection = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(path.dirname(require.main.filename), 'DataBase', 'BaseDatos.sqlite'),
    logging: false
});

module.exports = Connection;