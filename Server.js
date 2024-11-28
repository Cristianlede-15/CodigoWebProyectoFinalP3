require('dotenv').config();
const express = require('express');
const { Sequelize } = require('sequelize');
const sequelize = require('./config/AppDbContext');
const methodOverride = require('method-override');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;
const session = require('express-session');
const upload = require('./config/multerConfig'); 
const favoriteRoutes = require('./routes/favoriteRoutes');




// Importar los modelos
const Users = require('./models/Users');
const Business = require('./models/Business');
const BusinessTypes = require('./models/BusinessTypes');
const Categories = require('./models/Categories');
const Products = require('./models/Product');
const Addresses = require('./models/Adresses');
const Favorites = require('./models/Favorites');
const Orders = require('./models/Orders');
const OrderDetails = require('./models/OrderDetails');
const DeliveryStatus = require('./models/DeliveryStatus');

// Configuración de la base de datos
const dbPath = path.join(path.dirname(require.main.filename), 'DataBase', 'CenarDb.sqlite');
if (!fs.existsSync(dbPath)) {
    sequelize.sync({ alter: true }).then(() => {
        console.log('Database & tables created!');
    }).catch(err => {
        console.error('Error creando la base de datos y las tablas:', err);
    });
} else {
    console.log('La base de datos ya existe...');
}

// Crear el directorio 'uploads'
const uploadsDir = path.join(__dirname, 'ImagesRepo');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/ImagesRepo', express.static(path.join(__dirname, 'ImagesRepo')));

// Configurar EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));




// Definir relaciones entre los modelos

// Usuario y Negocio (Un usuario puede tener un negocio)
Users.hasOne(Business, { foreignKey: 'user_id', as: 'business' });
Business.belongsTo(Users, { foreignKey: 'user_id', as: 'owner' });

// Negocio y Tipo de Negocio
Business.belongsTo(BusinessTypes, { foreignKey: 'business_type_id', as: 'businessType' });
BusinessTypes.hasMany(Business, { foreignKey: 'business_type_id', as: 'businesses' });

// Negocio y Categorías
Business.hasMany(Categories, { foreignKey: 'business_id', as: 'categories' });
Categories.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });

// Categorías y Productos
Categories.hasMany(Products, { foreignKey: 'category_id', as: 'products' });
Products.belongsTo(Categories, { foreignKey: 'category_id', as: 'category' });

// Negocio y Productos
Business.hasMany(Products, { foreignKey: 'business_id', as: 'products' });
Products.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });

// Usuarios y Direcciones
Users.hasMany(Addresses, { foreignKey: 'user_id', as: 'addresses' });
Addresses.belongsTo(Users, { foreignKey: 'user_id', as: 'user' });

// Usuarios y Negocios (Favoritos)
Users.belongsToMany(Business, {
  through: Favorites,
  foreignKey: 'user_id',
  otherKey: 'business_id',
  as: 'favoriteBusinesses'
});
Business.belongsToMany(Users, {
  through: Favorites,
  foreignKey: 'business_id',
  otherKey: 'user_id',
  as: 'favoritedByUsers'
});

// Usuarios y Órdenes (Un usuario puede tener muchas órdenes)
Users.hasMany(Orders, { foreignKey: 'user_id', as: 'orders' });
Orders.belongsTo(Users, { foreignKey: 'user_id', as: 'customer' });

// Negocio y Órdenes (Un negocio puede tener muchas órdenes)
Business.hasMany(Orders, { foreignKey: 'business_id', as: 'orders' });
Orders.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });

// Direcciones y Órdenes (Una dirección puede estar asociada a muchas órdenes)
Addresses.hasMany(Orders, { foreignKey: 'address_id', as: 'orders' });
Orders.belongsTo(Addresses, { foreignKey: 'address_id', as: 'address' });

// Órdenes y Detalles de Órdenes
Orders.hasMany(OrderDetails, { foreignKey: 'order_id', as: 'orderDetails' });
OrderDetails.belongsTo(Orders, { foreignKey: 'order_id', as: 'order' });

// Productos y Detalles de Órdenes
Products.hasMany(OrderDetails, { foreignKey: 'product_id', as: 'orderDetails' });
OrderDetails.belongsTo(Products, { foreignKey: 'product_id', as: 'product' });

// Usuarios (Repartidores) y Órdenes (Un repartidor puede tener muchas órdenes asignadas)
Users.hasMany(Orders, { foreignKey: 'delivery_id', as: 'deliveries' });
Orders.belongsTo(Users, { foreignKey: 'delivery_id', as: 'deliverer' });

// Orders y DeliveryStatus
Orders.belongsTo(DeliveryStatus, { foreignKey: 'deliveryStatusId', as: 'deliveryStatus' });
DeliveryStatus.hasMany(Orders, { foreignKey: 'deliveryStatusId', as: 'orders' });

Users.hasOne(DeliveryStatus, { foreignKey: 'user_id', as: 'deliveryStatus' });
DeliveryStatus.belongsTo(Users, { foreignKey: 'user_id', as: 'user' });





// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'mi_secreto_seguro', // Se recomienda almacenar en `.env`.
        resave: false, // No guardar la sesión si no hay cambios.
        saveUninitialized: false, // No guardar sesiones vacías.
        cookie: {
            maxAge: 1000 * 60 * 60, // 1 hora.
            httpOnly: true, // Seguridad frente a ataques XSS.
        },
    })
);

// Importar y usar las rutas de autenticación
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

// Importar y usar las rutas de favoritos
app.use('/favorites', favoriteRoutes);


const cartRoutes = require('./routes/cartRoutes'); // Importar las rutas del carrito
app.use('/favorites', favoriteRoutes);
app.use('/', cartRoutes); // Usar las rutas del carrito



// Importar y usar las rutas de usuario
const userRoutes = require('./routes/UserRoutes');
app.use('/user', userRoutes);

// Importar y usar las rutas de delivery
const deliveryRoutes = require('./routes/deliveryRoutes');
app.use('/delivery', deliveryRoutes);

// Importar y usar las rutas de administrador
const adminRoutes = require('./routes/adminRoutes');
app.use('/admin', adminRoutes);

// Importar y usar las rutas de negocios
const businessRoutes = require('./routes/businessRoutes');
app.use('/business', businessRoutes);




// Ruta raíz que redirige a la página de inicio de sesión
app.get('/', (req, res) => {
    res.redirect('/auth/login');
});

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});