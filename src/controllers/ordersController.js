const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const ordersController = {

    async createOrder(request, reply) {

        try {
            const { shippingAddress, paymentMethod } = request.body;

            const cart = await Cart.findOne({ user: request.user._id })
                .populate('items.product');

            if (!cart || cart.items.length === 0) {
                return reply.status(400).send({
                    success: false,
                    message: 'Cart is empty'
                });
            }

            const orderItems = [];
            for (const cartItem of cart.items) {
                const product = cartItem.product;

                if (!product.availability || product.stock < cartItem.quantity) {
                    return reply.status(400).send({
                        success: false,
                        message: `Product "${product.name}" is not available in requested quantity`
                    });
                }

                orderItems.push({
                    product: product._id,
                    quantity: cartItem.quantity,
                    price: product.price,
                    name: product.name,
                    image: product.image
                });
            }

            const total = orderItems.reduce((sum, item) => {
                return sum + (item.price * item.quantity);
            }, 0);

            const order = await Order.create({
                user: request.user._id,
                items: orderItems,
                total,
                shippingAddress,
                paymentMethod
            });

            for (const item of orderItems) {
                await Product.findByIdAndUpdate(
                    item.product,
                    { $inc: { stock: -item.quantity } }
                );
            }

            await Cart.findOneAndUpdate(
                { user: request.user._id },
                { $set: { items: [] } }
            );

            await order.populate('items.product', 'name image');

            return reply.status(201).send({
                success: true,
                message: 'Order created successfully',
                data: order
            });

        } catch (error) {
            console.error('Create order error:', error);
            return reply.status(500).send({
                success: false,
                message: 'Error creating order'
            });
        }
    },

    async getUserOrders(request, reply) {
        try {
            const page = parseInt(request.query.page) || 1;
            const limit = parseInt(request.query.limit) || 10;
            const skip = (page - 1) * limit;

            const orders = await Order.find({ user: request.user._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('items.product', 'name image');

            const total = await Order.countDocuments({ user: request.user._id });
            const totalPages = Math.ceil(total / limit);

            return reply.send({
                success: true,
                data: orders,
                pagination: {
                    current: page,
                    totalPages,
                    totalOrders: total,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            });

        } catch (error) {
            console.error('Get orders error:', error);
            return reply.status(500).send({
                success: false,
                message: 'Error fetching orders'
            });
        }
    },

    async getOrderById(request, reply) {
        try {
            const order = await Order.findOne({
                _id: request.params.id,
                user: request.user._id
            }).populate('items.product', 'name image description');

            if (!order) {
                return reply.status(404).send({
                    success: false,
                    message: 'Order not found'
                });
            }

            return reply.send({
                success: true,
                data: order
            });

        } catch (error) {
            console.error('Get order error:', error);
            return reply.status(500).send({
                success: false,
                message: 'Error fetching order'
            });
        }
    },

    async updateOrderStatus(request, reply) {
        try {
            const { status } = request.body;

            const order = await Order.findByIdAndUpdate(
                request.params.id,
                { status },
                { new: true, runValidators: true }
            ).populate('items.product', 'name image');

            if (!order) {
                return reply.status(404).send({
                    success: false,
                    message: 'Order not found'
                });
            }

            return reply.send({
                success: true,
                message: 'Order status updated successfully',
                data: order
            });

        } catch (error) {
            console.error('Update order error:', error);
            return reply.status(500).send({
                success: false,
                message: 'Error updating order'
            });
        }
    },

    async getAllOrders(request, reply) {
        try {
            const page = parseInt(request.query.page) || 1;
            const limit = parseInt(request.query.limit) || 10;
            const skip = (page - 1) * limit;

            const filter = {};
            if (request.query.status) {
                filter.status = request.query.status;
            }

            const orders = await Order.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('user', 'name email')
                .populate('items.product', 'name image');

            const total = await Order.countDocuments(filter);
            const totalPages = Math.ceil(total / limit);

            return reply.send({
                success: true,
                data: orders,
                pagination: {
                    current: page,
                    totalPages,
                    totalOrders: total,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            });

        } catch (error) {
            console.error('Get all orders error:', error);
            return reply.status(500).send({
                success: false,
                message: 'Error fetching orders'
            });
        }
    }
};

module.exports = ordersController;

