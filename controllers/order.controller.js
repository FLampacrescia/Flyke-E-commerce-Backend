const crypto = require("crypto");
const Order = require("../models/order.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");

function generateOrderCode() {
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `ORD-${random}`;
}

async function createOrder(req, res) {
    try {
        const data = req.body;
        const userId = req.user._id;
        const user = await User.findById(userId);

        let shippingAddress = null;

        if (data.shipping === "delivery") {
            const selectedAddress = user.addresses.find(
                (addr) => addr._id.toString() === data.selectedAddressId
            );

            if (!selectedAddress) {
                return res.status(400).send({ message: "Dirección de envío no válida" });
            }

            shippingAddress = {
                name: user.name + " " + user.lastName,
                street: selectedAddress.street,
                city: selectedAddress.city,
                province: selectedAddress.province,
                postalCode: selectedAddress.postalCode,
            };
        }

        // Creamos la orden
        const order = new Order({
            orderCode: generateOrderCode(),
            user: userId,
            products: data.products,
            total: data.total,
            shipping: data.shipping,
            store: data.store || null,
            shippingAddress: shippingAddress
        });

        await checkOrderPrices(order.products);

        const newOrder = await order.save();

        return res.status(201).send({
            message: "Order created successfully",
            order: newOrder,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: "Error creating order",
        });
    }
}

async function checkOrderPrices(products) {
    for(const product of products) {

        const productDB = await Product.findById(product.product);
        if (!productDB) {
            throw new Error(`Product with ID ${product.product} not found`);
        }
        if (productDB.price !== product.price) {
            throw new Error(`Price mismatch for product with ID ${product.product}`);
        }
    }
}

async function getOrders(req, res) {
    try {

        const id = req.user._id;
        const user = req.user.role === "admin" ? {} : {user: id};

        const orders = await Order.find(user)
                                    .sort({ createdAt: -1 })
                                    .populate("user", "name email")
                                    .populate("products.product", "title price image")

        return res.status(200).send({
            message: "Orders retrieved successfully",
            orders
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: "Error retrieving orders",
        })
        
    }
}

async function getOrderById(req, res) {
    try {
        const { id } = req.params;

        const order = await Order.findById(id)
            .populate("user", "name email")
            .populate("products.product", "title price image");

        if (!order) {
            return res.status(404).send({
                message: "Order not found",
            });
        }

        // Si el usuario no es admin, solo puede ver sus propias órdenes
        if (req.user.role !== "admin" && order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).send({
                message: "Unauthorized access to this order",
            });
        }

        return res.status(200).send({
            message: "Order retrieved successfully",
            order,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: "Error retrieving the order",
        });
    }
}

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
};