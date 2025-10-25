const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    availability: {
        type: Boolean,
        default: true
    },
    image: {
        type: String,
        default: ''
    },
}, { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text'});
productSchema.index({ category: 1, price: 1 });
productSchema.index({ availability: 1, stock: 1 });

module.exports = mongoose.model('Product', productSchema);