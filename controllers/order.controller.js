const Order = require("../models/order.model");
const Product = require ("../models/product.model");

async function createOrder(req, res) {
    try {
        const data = req.body;
        const order = new Order(data);

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

module.exports = {
    createOrder,
    getOrders,
}