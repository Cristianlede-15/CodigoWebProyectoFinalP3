// controllers/orderController.js

const { Op } = require('sequelize'); // Import Op from Sequelize
const Order = require('../models/Orders');
const Product = require('../models/Product');
const Business = require('../models/Business');
const User = require('../models/Users');

exports.getDashboardMetrics = async (req, res) => {
    try {
        const totalOrders = await Order.count();

        // Define the start of today
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        // Define the start of tomorrow
        const startOfTomorrow = new Date(startOfToday);
        startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

        // Count orders created today
        const ordersToday = await Order.count({
            where: {
                createdAt: {
                    [Op.gte]: startOfToday,
                    [Op.lt]: startOfTomorrow
                }
            }
        });

        const activeBusinesses = await Business.count({ where: { is_active: true } }); // Ensure 'is_active' column exists
        const inactiveBusinesses = await Business.count({ where: { is_active: false } }); // Ensure 'is_active' column exists

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