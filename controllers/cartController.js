// controllers/cartController.js

const Product = require('../models/Product');
const Orders = require('../models/Orders');
const OrderDetails = require('../models/OrderDetails');
const Address = require('../models/Adresses'); // Asegúrate de que la ruta es correcta
const Business = require('../models/Business');
const Configuracion = require('../models/Configuracion'); // Importa el modelo Configuracion

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

    try {
        if (!cart || cart.items.length === 0) {
            return res.status(400).send('El carrito está vacío.');
        }

        // Obtener la configuración de ITBIS
        const configuracion = await Configuracion.findOne();
        const taxRate = configuracion ? configuracion.tax_rate : 0;

        // Calcular subtotal, impuestos y total
        const subtotal = cart.total;
        const taxAmount = subtotal * (taxRate / 100);
        const total = subtotal + taxAmount;

        // Crear el pedido
        const order = await Orders.create({
            user_id: user_id,
            address_id: address_id,
            business_id: req.session.business_id,
            subtotal: subtotal,
            tax_rate: taxRate,
            total: total
        });

        // Guardar los detalles del pedido
        for (const item of cart.items) {
            await OrderDetails.create({
                order_id: order.id,
                product_id: item.product.id,
                quantity: item.quantity,
                price: item.product.price
            });
        }

        // Vaciar el carrito y eliminar business_id de la sesión
        req.session.cart = { items: [], total: 0 };
        delete req.session.business_id;

        // Redirigir al home del cliente
        res.redirect('/user/home');
    } catch (error) {
        console.error('Error al procesar el checkout:', error);
        res.status(500).send('Error al procesar el checkout');
    }
};