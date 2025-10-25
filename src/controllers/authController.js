const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    const secret = process.env.JWT_SECRET || 'temporary-fallback-secret-for-testing-only-123';

    return jwt.sign(
        { userId },
        secret,
        { expiresIn: '7d' }
    );
};

const authController = {
    async register(request, reply) {
        try {
            const { name, email, password } = request.body;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return reply.status(400).send({
                    success: false,
                    message: 'User already exists with this email'
                });
            }

            const user = await User.create({ name, email, password });
            const token = generateToken(user._id);

            return reply.status(201).send({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    },
                    token
                }
            });

        } catch (error) {
            console.log(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal Server Error'
            });
        }
    },

    async login(request, reply) {
        try {
            const { email, password } = request.body;

            const user = await User.findOne({ email });
            if (!user) {
                return reply.status(401).send({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return reply.status(401).send({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            const token = generateToken(user._id);

            return reply.status(201).send({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    },
                    token
                }
            });

        } catch (error) {
            console.log(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal Server Error'
            });
        }
    }
};

module.exports = authController