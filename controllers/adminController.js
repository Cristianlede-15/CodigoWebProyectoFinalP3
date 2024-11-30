const Configuracion = require('../models/Configuracion');
const userController = require('./userController');
const Users = require('../models/Users');
const bcrypt = require('bcryptjs');
const Business = require('../models/Business');
const Sequelize = require('sequelize');


exports.mostrarConfiguracion = async (req, res) => {
    try {
        const configuracion = await Configuracion.findOne();
        if (!configuracion) {
            console.error('No se encontró la configuración');
            return res.render('adminViews/configuracion', { configuracion: { tax_rate: 'No disponible' } });
        }
        res.render('adminViews/configuracion', { configuracion });
    } catch (error) {
        console.error('Error fetching configuracion:', error);
        res.status(500).send('Error fetching configuracion');
    }
};

// Updated editarConfiguracion
exports.editarConfiguracion = async (req, res) => {
    try {
        let configuracion = await Configuracion.findOne();
        if (!configuracion) {
            configuracion = new Configuracion({ tax_rate: 0 }); // Valor por defecto
            await configuracion.save();
        }
        res.render('adminViews/editarConfiguracion', { configuracion });
    } catch (err) {
        console.error('Error al obtener la configuración:', err);
        res.status(500).send("Error al obtener la configuración");
    }
};

exports.guardarConfiguracion = async (req, res) => {
    try {
        const { tax_rate } = req.body;

        let configuracion = await Configuracion.findOne();
        if (configuracion) {
            configuracion.tax_rate = tax_rate;
            await configuracion.save();
        } else {
            configuracion = new Configuracion({ tax_rate });
            await configuracion.save();
        }

        res.redirect('/admin/configuracion');
    } catch (error) {
        console.error('Error updating configuracion:', error);
        res.status(500).send('Error updating configuracion');
    }
};

exports.mostrarClientes = async (req, res) => {
    try {
        const clientes = await userController.getUsersByRole('client');
        res.render('adminViews/clientes', { clientes });
    } catch (error) {
        console.error('Error fetching clientes:', error);
        res.status(500).send('Error fetching clientes');
    }
};

// Activar administrador
// Activar administrador
exports.activarAdmin = async (req, res) => {
    const adminId = req.params.id;
    if (adminId === req.user.id) {
        return res.status(400).send('No puedes activar tu propio usuario.');
    }
    try {
        await Users.update({ is_active: true }, { where: { id: adminId } });
        res.redirect('/admin/administradores');
    } catch (error) {
        console.error('Error activando administrador:', error);
        res.status(500).send('Error activando administrador');
    }
};

// Inactivar administrador
exports.inactivarAdmin = async (req, res) => {
    const adminId = req.params.id;
    if (adminId === req.user.id) {
        return res.status(400).send('No puedes inactivar tu propio usuario.');
    }
    try {
        await Users.update({ is_active: false }, { where: { id: adminId } });
        res.redirect('/admin/administradores');
    } catch (error) {
        console.error('Error inactivando administrador:', error);
        res.status(500).send('Error inactivando administrador');
    }
};

// Mostrar formulario de edición
exports.mostrarEditarAdmin = async (req, res) => {
    const adminId = req.params.id;
    if (adminId === req.user.id) {
        return res.status(400).send('No puedes editar tu propio usuario.');
    }
    try {
        const admin = await Users.findByPk(adminId);
        if (!admin) {
            return res.status(404).send('Administrador no encontrado');
        }
        res.render('adminViews/editarAdministrador', { admin });
    } catch (error) {
        console.error('Error mostrando formulario de edición:', error);
        res.status(500).send('Error mostrando formulario de edición');
    }
};

// Editar administrador
exports.editarAdmin = async (req, res) => {
    const adminId = req.params.id;
    if (adminId === req.user.id) {
        return res.status(400).send('No puedes editar tu propio usuario.');
    }
    const { first_name, last_name, cedula, email, username, password, confirm_password } = req.body;

    // Validaciones
    if (!first_name || !last_name || !cedula || !email || !username) {
        return res.status(400).send('Todos los campos son requeridos.');
    }
    if (password && password !== confirm_password) {
        return res.status(400).send('Las contraseñas no coinciden.');
    }

    try {
        const updateData = { first_name, last_name, cedula, email, username };
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }
        await Users.update(updateData, { where: { id: adminId } });
        res.redirect('/admin/administradores');
    } catch (error) {
        console.error('Error editando administrador:', error);
        res.status(500).send('Error editando administrador');
    }
};

// Activar/Inactivar Cliente
exports.toggleCliente = async (req, res) => {
    const clienteId = req.params.id;
    try {
        const cliente = await Users.findByPk(clienteId); // Usa 'Users' en lugar de 'User'
        if (!cliente) {
            return res.status(404).send('Cliente no encontrado');
        }

        // Invertir el estado de is_active
        cliente.is_active = !cliente.is_active;
        await cliente.save();

        res.redirect('/admin/clientes');
    } catch (error) {
        console.error('Error toggling cliente:', error);
        res.status(500).send('Error toggling cliente');
    }
};

// **Nuevo Método para Activar/Inactivar Delivery**
exports.toggleDelivery = async (req, res) => {
    const deliveryId = req.params.id;
    try {
        const delivery = await Users.findByPk(deliveryId);
        if (!delivery) {
            return res.status(404).send('Delivery no encontrado');
        }

        delivery.is_active = !delivery.is_active;
        await delivery.save();

        res.redirect('/admin/delivery');
    } catch (error) {
        console.error('Error toggling delivery:', error);
        res.status(500).send('Error toggling delivery');
    }
};


exports.searchBusinesses = async (req, res) => {
    try {
        const { query } = req.query;
        const comercios = await Business.findAll({
            where: {
                business_name: {
                    [Sequelize.Op.like]: `%${query}%`
                }
            }
        });
        res.render('adminViews/comercios', { comercios });
    } catch (error) {
        console.error('Error searching businesses:', error);
        res.status(500).send('Error searching businesses');
    }
};