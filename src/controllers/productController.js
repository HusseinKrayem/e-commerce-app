const { hash } = require('bcrypt');
const Product = require('../models/Product');

const productController = {

    async createProduct(request, reply) {

        try {
            
            const product = await Product.create(request.body);

            return reply.status(201).send({                success: true,
            message: 'Product created successfully',
            data: product
        });

        } catch (error) {
           console.log(error);
           return reply.status(500).send({
            success: false,
            message: 'Internal Server Error'
           }); 
        }

    },

    async getAllProducts(request, reply) {

        try {
            
            const page = parseInt(request.query.page) || 1;
            const limit = parseInt(request.query.limit) || 10;
            const skip = (page - 1) * limit;


            const filter = {};
            if (request.query.category) {
                filter.category = request.query.category;
            }
            if (request.query.availability) {
                filter.availability = request.query.availability === 'true';
            }
            if (request.query.minPrice || request.query.maxPrice) {
                filter.price = {};
                if (request.query.minPrice) {
                    filter.price.$gte = parseFloat(request.query.minPrice);
                }
                if (request.query.maxPrice) {
                    filter.price.$lte = parseFloat(request.query.maxPrice);
                }
            }


            const sort = {};
            if (request.query.sort) {
                const sortField = request.query.sort;
                sort[sortField] = request.query.order === 'desc' ? -1 : 1;
            } else {
                sort.createdAt = -1;
            }


            const products = await Product.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean();


            const total = await Product.countDocuments(filter);
            const totalPages = Math.ceil(total / limit);


            return reply.status(200).send({
                success: true,
                data: products,
                pagination: {
                    current: page,
                    totalPages,
                    totalProducts: total,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
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

    async getProductById(request, reply) {

        try {
            
            const product = await Product.findById(request.params.id);

            if (!product) {
                return reply.status(404).send({
                    success: false,
                    message: 'Product not found'
                });
            }

            return reply.status(200).send({
                success: true,
                data: product
            });

        } catch (error) {
            console.log(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal Server Error'
            });
        }

    },

    async updateProduct(request, reply) {
        
        try {
            
            const product = await Product.findByIdAndUpdate(request.params.id, request.body, { new: true, runValidators: true });

            if (!product) {
                return reply.status(404).send({
                    success: false,
                    message: 'Product not found'
                });
            }

            return reply.status(200).send({
                success: true,
                message: 'Product updated successfully',
                data: product
            });

        } catch (error) {
            console.log(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal Server Error'
            });      
        }
    },

    async deleteProduct(request, reply) {

        try {
            
            const product = await Product.findByIdAndDelete(request.params.id);

            if (!product) {
                return reply.status(404).send({
                    success: false,
                    message: 'Product not found'
                });
            }

            return reply.status(200).send({
                success: true,
                message: 'Product deleted successfully'
            });

        } catch (error) {
            console.log(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal Server Error'
            });
        }

    },

    async searchProducts(request, reply) {

        try {
            
            const { q, category, minPrice, maxPrice, availability } = request.query;

            const filter = {};
            if (q) {
                filter.$text = { $search: q };
            }

            if (category) {
                filter.category = category;
            }
            if (availability) {
                filter.availability = availability === 'true';
            }
            if (minPrice || maxPrice) {
                filter.price = {};
                if (minPrice) {
                    filter.price.$gte = parseFloat(minPrice);
                }
                if (maxPrice) {
                    filter.price.$lte = parseFloat(maxPrice);
                }
            }

            const products = await Product.find(filter).sort({ score: { $meta: "textScore" } }).limit(20);

            return reply.status(200).send({
                success: true,
                data: products,
                count: products.length
            });

        } catch (error) {
            console.log(error);
            return reply.status(500).send({
                success: false,
                message: 'Internal Server Error'
            });
        }

    }
}

module.exports = productController;