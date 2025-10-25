const Cart = require('../models/Cart');
const Product = require('../models/Product');

const cartController = {

    async getCart(request, reply) {

        try {

            const cart = await Cart.findOne({ user: request.user._id }).populate('items.product', 'name price image availability');

            if (!cart) {
                const newCart = await Cart.create({
                    user: request.user._id,
                    items: []
                });
                return reply.send({
                    success: true,
                    data: newCart
                });
            }

            return reply.send({
                success: true,
                data: cart
            })



        } catch (error) {
            console.log(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal Server Error'
            });
        }
    },

    async addToCart(request, reply) {
        try {
            const { productId, quantity = 1 } = request.body;

            const product = await Product.findById(productId);
            if (!product) {
                return reply.status(404).send({
                    success: false,
                    message: 'Product not found'
                });
            }

            if (!product.availability || product.stock < quantity) {
                return reply.status(400).send({
                    success: false,
                    message: 'Product not available or insufficient stock'
                });
            }

            let cart = await Cart.findOne({ user: request.user._id });

            if (!cart) {
                cart = await Cart.create({
                    user: request.user._id,
                    items: []
                });
            }

            if (!cart.items) {
                cart.items = [];
            }

            const existingItemIndex = cart.items.findIndex(
                item => item.product && item.product.toString() === productId
            );

            if (existingItemIndex > -1) {
                cart.items[existingItemIndex].quantity += quantity;
            } else {
                cart.items.push({
                    product: productId,
                    quantity,
                    price: product.price
                });
            }

            await cart.save();
            await cart.populate('items.product', 'name price image availability');

            return reply.send({
                success: true,
                message: 'Item added to cart',
                data: cart
            });

        } catch (error) {
            console.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal Server Error'
            });
        }
    },

    async updateCartItem(request, reply) {
        try {
            const { itemId } = request.params;
            const { quantity } = request.body;

            const cart = await Cart.findOne({ user: request.user._id });
            if (!cart) {
                return reply.status(404).send({
                    success: false,
                    message: 'Cart not found'
                });
            }

            const item = cart.items.find(item => item._id.toString() === itemId);

            if (!item) {
                return reply.status(404).send({
                    success: false,
                    message: 'Item not found in cart'
                });
            }

            const product = await Product.findById(item.product);
            if (!product.availability || product.stock < quantity) {
                return reply.status(400).send({
                    success: false,
                    message: 'Insufficient stock'
                });
            }

            item.quantity = quantity;

            await cart.save();
            await cart.populate('items.product', 'name price image availability');

            return reply.send({
                success: true,
                message: 'Cart updated successfully',
                data: cart
            });

        } catch (error) {
            console.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal Server Error'
            });
        }
    },

    async removeFromCart(request, reply) {

        try {
            const { itemId } = request.params;

            const cart = await Cart.findOne({ user: request.user._id });
            if (!cart) {
                return reply.status(404).send({
                    success: false,
                    message: 'Cart not found'
                });
            }

            cart.items.pull(itemId);
            await cart.save();
            await cart.populate('items.product', 'name price image availability');

            return reply.send({
                success: true,
                message: 'Item removed from cart',
                data: cart
            });

        } catch (error) {
            console.log(error)
            return reply.status(500).send({
                success: false,
                message: 'Internal Server Error'
            });
        }
    },

    async clearCart(request, reply) {
        try {
            const cart = await Cart.findOne({ user: request.user._id });

            if (!cart) {
                return reply.status(404).send({
                    success: false,
                    message: 'Cart not found'
                });
            }

            cart.items = [];
            await cart.save();

            return reply.send({
                success: true,
                message: 'Cart cleared successfully',
                data: cart
            });

        } catch (error) {
            console.log(error)
            return reply.status(500).send({
                success: false,
                message: 'Internal Server Error'
            });
        }
    }

};

module.exports = cartController;