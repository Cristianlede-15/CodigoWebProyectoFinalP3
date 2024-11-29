// controllers/cartController.js

const Product = require('../models/Product');
const Orders = require('../models/Orders');
const OrderDetails = require('../models/OrderDetails');
const Address = require('../models/Adresses'); // Asegúrate de que la ruta es correcta
const Business = require('../models/Business');
const Configuracion = require('../models/Configuracion'); // Importa el modelo Configuracion
const User = require('../models/Users');
const DeliveryStatus = require('../models/DeliveryStatus');

exports.addToCart = async (req, res) => {
    const { product_id } = req.body;

    // Obtener o crear el carrito en la sesión
    if (!req.session.cart) {
        req.session.cart = { items: [], total: 0 };
    }

    const cart = req.session.cart;

    try {
        const product = await Product.findByPk(product_id);

        if (!product) {
            return res.status(404).send('Producto no encontrado');
        }

        // Guardar el business_id en la sesión
        req.session.business_id = product.business_id;

        // Verificar si el producto ya está en el carrito
        const existingItem = cart.items.find(item => item.product.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.items.push({ product, quantity: 1 });
        }

        // Actualizar el total del carrito
        cart.total += parseFloat(product.price);

        // Redirigir de vuelta a la página anterior o al comercio
        res.redirect('/user/comercio/' + product.business_id);
    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        res.status(500).send('Error al agregar al carrito');
    }
};

// controllers/cartController.js

exports.removeFromCart = (req, res) => {
    try {
        const { productId } = req.body;
        console.log('Received productId to remove:', productId);

        const cart = req.session.cart;

        if (!cart) {
            console.error('No cart found in session.');
            return res.status(400).send('No cart found.');
        }

        console.log('Current cart items:', cart.items);

        const parsedProductId = parseInt(productId, 10);
        const itemIndex = cart.items.findIndex(item => item.product.id === parsedProductId);

        if (itemIndex > -1) {
            const item = cart.items[itemIndex];
            cart.total -= parseFloat(item.product.price);
            cart.items.splice(itemIndex, 1);
            console.log('Removed product:', item.product.name);
            console.log('Updated cart total:', cart.total);
        } else {
            console.warn('Product not found in cart:', productId);
        }

        res.redirect('back');
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).send('Error removing from cart');
    }
};

exports.checkout = async (req, res) => {
    const user_id = req.session.user.id;
    const cart = req.session.cart;
    const address_id = req.body.address_id; // ID de la dirección seleccionada

    console.log(`ID del usuario: ${user_id}`);
    console.log(`Carrito: ${JSON.stringify(cart)}`);
    console.log(`ID de la dirección: ${address_id}`);

    if (!cart || cart.items.length === 0) {
        return res.status(400).send('El carrito está vacío.');
    }

    try {
        // 1. Asignar un delivery disponible
        const delivery = await User.findOne({
            where: { role: 'delivery' },
            include: [{
                model: DeliveryStatus,
                as: 'deliveryStatus',
                where: { is_available: true }
            }]
        });

        console.log('Delivery asignado:', delivery);

        if (!delivery) {
            return res.status(400).send('No hay deliverys disponibles en este momento.');
        }

        // Calcular subtotal y tax_rate
        const subtotal = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        const tax_rate = 0.18; // Ejemplo de tasa de impuesto del 18%
        const business_id = req.session.business_id;

        console.log(`Subtotal: ${subtotal}, Tax Rate: ${tax_rate}, Business ID: ${business_id}`);

        // 2. Crear el pedido
        const order = await Orders.create({
            user_id,
            address_id,
            delivery_id: delivery.id, // Asignar el delivery al pedido
            status: 'in_process', // Cambiar el estado a 'in_process'
            total: cart.total,
            subtotal,
            tax_rate,
            business_id
        });

        console.log('Pedido creado:', order);

        // 3. Agregar los detalles del pedido
        for (const item of cart.items) {
            await OrderDetails.create({
                order_id: order.id,
                product_id: item.product.id,
                quantity: item.quantity,
                price: item.product.price
            });
        }

        // 4. Actualizar la disponibilidad del delivery
        await DeliveryStatus.update(
            { is_available: false },
            { where: { user_id: delivery.id } }
        );

        console.log('Disponibilidad del delivery actualizada.');

        // 5. Limpiar el carrito de la sesión
        req.session.cart = { items: [], total: 0 };

        res.redirect(`${req.baseUrl}/orders/confirmation`);
    } catch (error) {
        console.error('Error en el checkout:', error);
        res.status(500).send('Error interno del servidor');
    }
};

// controllers/cartController.js

exports.confirmation = (req, res) => {
    res.render('clienteViews/confirmation');
};