// controllers/cartController.js

const Product = require('../models/Product');

exports.addToCart = async (req, res) => {
    const { product_id } = req.body;

    console.log('Producto ID:', product_id); // Línea de depuración

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

        // Verificar si el producto ya está en el carrito
        const existingItem = cart.items.find(item => item.product.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
            console.log('Producto existente, cantidad actualizada:', existingItem.quantity); // Línea de depuración
        } else {
            cart.items.push({ product, quantity: 1 });
            console.log('Producto agregado al carrito:', product.name); // Línea de depuración
        }

        // Actualizar el total del carrito
        cart.total += parseFloat(product.price);
        console.log('Total del carrito actualizado:', cart.total); // Línea de depuración

        // Redirigir de vuelta a la página anterior
        res.location(req.get('Referrer') || '/');
        res.redirect('back');
    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        res.status(500).send('Error al agregar al carrito');
    }
};

exports.checkout = (req, res) => {
    // Lógica para procesar el pago y completar la compra

    // Vaciar el carrito después de la compra
    req.session.cart = { items: [], total: 0 };

    res.send('Compra realizada con éxito');
};