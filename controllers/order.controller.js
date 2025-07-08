const crypto = require("crypto");
const Order = require("../models/order.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");
const { MercadoPagoConfig, Preference } = require('mercadopago');

const mercadopagoClient = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
});


function generateOrderCode() {
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `ORD-${random}`;
}

async function createOrder(req, res) {
    try {
        const data = req.body;
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!data || !data.products || !data.total || !data.shipping) {
            return res.status(400).send({ message: "Datos incompletos en la solicitud" });
        }

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
                zipCode: selectedAddress.zipCode,
            };
        }

        const validatedProducts = await checkOrderPrices(data.products);

        const order = new Order({
            orderCode: generateOrderCode(),
            user: userId,
            products: data.products,
            total: data.total,
            shipping: data.shipping,
            store: data.store || null,
            shippingAddress: shippingAddress,
        });
        
        const savedOrder = await order.save();

        const items = validatedProducts.map((p) => ({
            title: p.title,
            quantity: p.quantity,
            unit_price: p.price,
            currency_id: "ARS",
        }));

        const preference = new Preference(mercadopagoClient);

        const response = await preference.create({
            body: {
                items,
                back_urls: {
                    success: `${process.env.FLYKE_URL}/checkout/order-success`,
                    failure: `${process.env.FLYKE_URL}/checkout/order-failure`,
                    pending: `${process.env.FLYKE_URL}/checkout/order-pending`,
                },
                auto_return: 'approved',
                payment_methods: {
                    excluded_payment_types: [
                        { id: "ticket" },
                        { id: "bank_transfer" },
                    ],
                    installments: 1,
                },
                external_reference: order.orderCode,
                // notification_url: `${process.env.SERVER_URL}/api/mercadopago/webhook`,
            },
        });

        return res.status(201).send({
            response,
            id: response.id,
            order: savedOrder,
            init_point: response.init_point,
            status: "Orden creada exitosamente",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: "Error creating order",
        });
    }
}

async function checkOrderPrices(products) {
    const validatedProducts = [];

    for (const product of products) {
        const productDB = await Product.findById(product.product);
        if (!productDB) {
            throw new Error(`Product with ID ${product.product} not found`);
        }

        if (productDB.price !== product.price) {
            throw new Error(`Price mismatch for product with ID ${product.product}`);
        }

        validatedProducts.push({
            ...product,
            title: productDB.title,
        });
    }

    return validatedProducts;
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

async function getOrderByOrderCode(req, res) {
    try {
        const order = await Order.findOne({ orderCode: req.params.orderCode })
                                    .populate('products.product');
        if (!order) return res.status(404).json({ message: "Orden no encontrada" });
        res.json(order);
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: "Error searching for order",
        });
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
    getOrderByOrderCode,
    getOrderById,
};