const { get } = require('mongoose');
const User = require('../models/User');

const usersController = {
    async getAllUsers(request, reply) {
        try {

            const users = await User.find().select('-password');

            return reply.status(200).send({
                success: true,
                count: users.length,
                data: users
            });

        } catch (error) {
            console.log(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal Server Error'
            });
        };
    },

    async getUserById(request, reply) {
        try {

            const user = await User.findById(request.params.id).select('-password');

            if (!user) {
                return reply.status(404).send({
                    success: false,
                    message: 'User not found'
                });
            }

            return reply.status(200).send({
                success: true,
                data: user
            });

        } catch (error) {

            console.log(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal Server Error'
            });

        }
    },

    async getCurrentUser(request, reply) {
        try {

            return reply.status(200).send({
                success: true,
                data: request.user
            });

        } catch (error) {
            console.log(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal Server Error'
            });
        }
    },

    async updateUser(request, reply) {
        try {
            const { name, email } = request.body;

            let existingUser = null;

            if (email) {
                existingUser = await User.findOne({
                    email,
                    _id: { $ne: request.params.id }
                });
            }

            if (existingUser) {
                return reply.status(400).send({
                    success: false,
                    message: 'Email already in use'
                });
            }

            const updatedUser = await User.findByIdAndUpdate(
                request.params.id,
                { name, email },
                { new: true, runValidators: true }
            ).select('-password');

            if (!updatedUser) {
                return reply.status(404).send({
                    success: false,
                    message: 'User not found'
                });
            }

            return reply.send({
                success: true,
                message: 'User updated successfully',
                data: updatedUser
            });

        } catch (error) {
            console.error('Update user error:', error);
            return reply.status(500).send({
                success: false,
                message: 'Error updating user'
            });
        }
    },

    async deleteUser(request, reply) {
        try {

            const user = await User.findByIdAndDelete(request.params.id);

            if (!user) {
                return reply.status(404).send({
                    success: false,
                    message: 'User not found'
                });
            }

            return reply.status(200).send({
                success: true,
                message: 'User deleted successfully'
            });

        } catch (error) {
            console.log(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal Server Error'
            });
        }
    },

    async createAdminUser(request, reply) {
        try {
            const { name, email, password } = request.body;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return reply.status(400).send({
                    success: false,
                    message: 'User already exists with this email'
                });
            }

            const adminUser = await User.create({
                name,
                email,
                password,
                role: 'admin'
            });

            return reply.status(201).send({
                success: true,
                message: 'Admin user created successfully',
                data: {
                    id: adminUser._id,
                    name: adminUser.name,
                    email: adminUser.email,
                    role: adminUser.role
                }
            });

        } catch (error) {
            console.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal Server Error'
            });
        }
    }
};

module.exports = usersController;