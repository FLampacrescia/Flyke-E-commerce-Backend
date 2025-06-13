const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
    orderCode: {
        type: String,
        unique: true,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    total: {
        type: Number,
        required: true
    },
    shipping: {
        type: String,
        enum: ['delivery', 'pickup'],
        required: true
    },
    store: {
        type: String,
        default: null
    },
    shippingAddress: {
        name: String,
        street: String,
        city: String,
        province: String,
        zipCode: String
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'canceled'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);