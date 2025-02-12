const Users = require('../models/Users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generateToken = require('../services/tokenService');
const sendEmail = require('../services/emailService');
const { Op } = require('sequelize');
const Business = require('../models/Business');
const BusinessTypes = require('../models/BusinessTypes');
const path = require('path');
const DeliveryStatus = require('../models/DeliveryStatus'); // Importa el modelo DeliveryStatus


// Registro de usuario
exports.register = async (req, res) => {
    const { email, username, password, role, first_name, last_name, phone, confirm_password } = req.body;
    // Obtener el nombre del archivo de la imagen de perfil si se subió
    const profile_image = req.file ? req.file.filename : 'default.png';
    
    try {
        // Validar contraseñas
        if (password !== confirm_password) {
            return res.status(400).json({ message: 'Las contraseñas no coinciden.' });
        }

        // Verificar si el correo ya está registrado
        const existingUser = await Users.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'El correo ya está registrado.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const activationToken = generateToken();
        const user = await Users.create({
            email,
            username,
            password: hashedPassword,
            role,
            first_name,
            last_name,
            phone,
            profile_image, // Guardar el nombre del archivo
            activation_token: activationToken,
            is_active: false
        });

        // Crear registro en DeliveryStatus si el rol es 'delivery'
        if (role === 'delivery') {
            await DeliveryStatus.create({ userId: user.id, status: 'available' });
        }

        // Envío de correo de activación
        const activationLink = `http://${req.headers.host}/auth/activate/${activationToken}`;
        const subject = 'Account Activation';
        const text = `Please click on the following link to activate your account:\n\n${activationLink}\n\nIf you did not request this, please ignore this email.`;

        sendEmail(email, subject, text);

        res.status(200).json({ message: 'Registro exitoso. Por favor, revisa tu correo para activar tu cuenta.' });
    } catch (error) {
        console.error('Error registrando usuario:', error);
        res.status(500).json({ message: 'Error registrando usuario', error });
    }
};

// Activación de cuenta
exports.activateAccount = async (req, res) => {
    const { token } = req.params;
    try {
        const user = await Users.findOne({ where: { activation_token: token } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid activation token' });
        }

        user.is_active = true;
        user.activation_token = null;
        await user.save();

        res.status(200).json({ message: 'Account activated successfully' });
    } catch (error) {
        console.error('Error activating account:', error);
        res.status(500).json({ message: 'Error activating account', error });
    }
};

// authController.js

exports.login = async (req, res) => {
    const { identifier, password } = req.body; // 'identifier' puede ser email o username para usuarios regulares
    try {
        // Intentar encontrar en la tabla Business solo por email
        let business = await Business.findOne({
            where: { email: identifier },
            include: [{ model: Users, as: 'owner' }]
        });

        if (business) {
            if (!business.is_active) {
                return res.status(401).json({ message: 'Cuenta no activada, revise su correo o pongase en contacto con un administrador.' });
            }

            const isPasswordValid = await bcrypt.compare(password, business.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Contraseña incorrecta' });
            }

            // Establecer datos en la sesión
            req.session.user = {
                id: business.id, // Usar 'id' del negocio
                nombre: business.business_name,
                email: business.email,
                role: 'business'
            };
            req.session.business_id = business.id; // Asegurarse de que se establece correctamente

            console.log('Sesión de usuario establecida:', req.session);

            return res.redirect('/business/home');
        }

        // Si no es un business, intentar encontrar en la tabla Users por email o username
        let user = await Users.findOne({
            where: {
                [Op.or]: [{ email: identifier }, { username: identifier }]
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (!user.is_active) {
            return res.status(401).json({ message: 'Cuenta no activada, revise su correo o pongase en contacto con un administrador.' });
        }

        const isPasswordValidUser = await bcrypt.compare(password, user.password);
        if (!isPasswordValidUser) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Establecer datos en la sesión
        req.session.user = {
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            role: user.role
        };

        console.log('Sesión de usuario establecida:', req.session);

        // Redirigir según el rol del usuario
        let redirectUrl = '/';
        switch (user.role) {
            case 'client':
                redirectUrl = '/user/home';
                break;
            case 'delivery':
                redirectUrl = '/delivery/home';
                break;
            case 'business':
                redirectUrl = '/business/home';
                break;
            case 'admin':
                redirectUrl = '/admin/dashboard';
                break;
            default:
                redirectUrl = '/business/home';
                break;
        }

        res.redirect(redirectUrl);
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Error al iniciar sesión', error });
    }
};

// authController.js

exports.showLoginPage = (req, res) => {
    if (req.session.user) {
        // Redirigir según el rol del usuario
        let redirectUrl = '/';
        switch (req.session.user.role) {
            case 'client':
                redirectUrl = '/user/home';
                break;
            case 'delivery':
                redirectUrl = '/delivery/home';
                break;
            case 'business':
                redirectUrl = '/business/home';
                break;
            case 'admin':
                redirectUrl = '/admin/dashboard';
                break;
            default:
                redirectUrl = '/';
                break;
        }
        return res.redirect(redirectUrl);
    }
    res.render('loginViews/login', { layout: false });
};


// Solicitud de Restablecimiento de Contraseña
exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await Users.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generación de Token
        const token = generateToken();
        const expiration = Date.now() + 3600000; // 1 hora de validez

        user.password_reset_token = token;
        user.password_reset_token_expiration = expiration;
        await user.save();

        // Envío de Correo
        const resetLink = `http://${req.headers.host}/auth/reset/${token}`;
        const subject = 'Password Reset';
        const text = `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                      Please click on the following link, or paste this into your browser to complete the process:\n\n
                      ${resetLink}\n\n
                      If you did not request this, please ignore this email and your password will remain unchanged.\n`;

        sendEmail(email, subject, text);

        res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
        res.status(500).json({ message: 'Error requesting password reset', error });
    }
};

// Restablecimiento de Contraseña
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const user = await Users.findOne({ where: { password_reset_token: token } });
        if (!user || user.password_reset_token_expiration < Date.now()) {
            return res.status(400).json({ message: 'Token is invalid or has expired' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.password_reset_token = null;
        user.password_reset_token_expiration = null;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error resetting password', error });
    }
};

// Cerrar sesión

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).send('Error al cerrar sesión.');
        }
        res.redirect('/auth/login');
    });
};
// Crear admin
exports.createAdmin = async (req, res) => {
    try {
        const { first_name, last_name, cedula, email, username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = await Users.create({
            first_name,
            last_name,
            cedula,
            email,
            username,
            password: hashedPassword,
            role: 'admin',
            is_active: true
        });

        res.redirect('/admin/administradores');
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).send('Error creating admin');
    }
};


// Obtener tipos de comercio y renderizar el formulario de registro de comercio
exports.getRegisterBusiness = async (req, res) => {
    try {
        const tiposComercios = await BusinessTypes.findAll();
        res.render('loginViews/registerBusiness', { layout: false, tiposComercios });
    } catch (error) {
        console.error('Error obteniendo tipos de comercio:', error);
        res.status(500).send('Error al obtener los tipos de comercio');
    }
};


// Registro de comercio
exports.registerBusiness = async (req, res) => {
    console.log('--- Register Business ---');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);

    const { business_name, phone, email, opening_time, closing_time, business_type, password, confirm_password } = req.body;
    const logo = req.file ? req.file.filename : 'default.png'; // Guardar solo el nombre del archivo

    try {
        // Validaciones necesarias
        if (password !== confirm_password) {
            return res.status(400).json({ message: 'Las contraseñas no coinciden.' });
        }

        // Verificar si el correo ya está registrado
        const existingBusiness = await Business.findOne({ where: { email } });
        if (existingBusiness) {
            return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generar token de activación
        const activationToken = generateToken();
        const activationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 horas

        // Crear registro de negocio
        const newBusiness = await Business.create({
            business_name,
            phone,
            email,
            opening_time,
            closing_time,
            business_type_id: business_type,
            password: hashedPassword,
            logo: logo,
            activation_token: activationToken,
            activation_token_expires: activationTokenExpires,
            is_active: false
        });

        // Envío de correo de activación
        const activationLink = `http://${req.headers.host}/auth/activateBusiness/${activationToken}`;
        const subject = 'Activación de Cuenta de Comercio';
        const text = `Haz clic en el siguiente enlace para activar tu cuenta de comercio:\n\n${activationLink}`;

        sendEmail(email, subject, text);

        res.status(200).json({ message: 'Comercio registrado exitosamente. Revisa tu correo para activar la cuenta.' });
    } catch (error) {
        console.error('Error registrando comercio:', error);
        res.status(500).json({ message: 'Error registrando comercio', error });
    }
};


exports.activateBusinessAccount = async (req, res) => {
    const { token } = req.params;
    console.log('Token recibido:', token); // Log del token recibido
    try {
        const business = await Business.findOne({
            where: {
                activation_token: token,
                activation_token_expires: {
                    [Op.gt]: new Date()
                }
            }
        });
        console.log('Negocio encontrado:', business); // Log del negocio encontrado

        if (!business) {
            return res.status(400).json({ message: 'Invalid activation token' });
        }

        business.is_active = true;
        business.activation_token = null;
        business.activation_token_expires = null;
        await business.save();

        res.status(200).json({ message: 'Business account activated successfully' });
    } catch (error) {
        console.error('Error activando cuenta de comercio:', error);
        res.status(500).json({ message: 'Error activating business account', error });
    }
};