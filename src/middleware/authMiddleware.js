const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (request, reply) => {
    try {

        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return reply.status(401).send({
                success: false,
                message: 'No token provided'
            });
        }

        const token = authHeader.substring(7);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId || decoded.id || decoded._id;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return reply.status(401).send({
                success: false,
                message: 'User not found'
            });
        }

        request.user = user;

    } catch (error) {
        console.log(error);
        return reply.status(401).send({
            success: false,
            message: 'Invalid token'
        });
    }
};

module.exports = authMiddleware;