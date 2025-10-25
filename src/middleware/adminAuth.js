const adminAuth = async (request, reply) => {

  try {

    if (!request.user) {
      return reply.status(401).send({
        success: false,
        message: 'Authentication required'
      });
    }

    if (request.user.role !== 'admin') {
      return reply.status(403).send({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
  } catch (error) {
    console.error(error);
    return reply.status(500).send({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = adminAuth;