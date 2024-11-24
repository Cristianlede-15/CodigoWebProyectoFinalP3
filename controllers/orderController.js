const Order = require('../models/Orders');
const Product = require('../models/Product');
const Business = require('../models/Business');
const User = require('../models/Users');

exports.getDashboardMetrics = async (req, res) => {
    try {
        const totalOrders = await Order.count();
        const ordersToday = await Order.count({ where: { createdAt: new Date().toISOString().slice(0, 10) } });
        const activeBusinesses = await Business.count(); // Ajusta esta línea si no tienes la columna is_active
        const inactiveBusinesses = 0; // Ajusta esta línea si no tienes la columna is_active
        const activeClients = await User.count({ where: { role: 'client', is_active: true } });
        const inactiveClients = await User.count({ where: { role: 'client', is_active: false } });
        const activeDeliveries = await User.count({ where: { role: 'delivery', is_active: true } });
        const inactiveDeliveries = await User.count({ where: { role: 'delivery', is_active: false } });
        const totalProducts = await Product.count();

        res.render('adminViews/dashboard', {
            totalOrders,
            ordersToday,
            activeBusinesses,
            inactiveBusinesses,
            activeClients,
            inactiveClients,
            activeDeliveries,
            inactiveDeliveries,
            totalProducts
        });
    } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        res.status(500).send('Error fetching dashboard metrics');
    }
};