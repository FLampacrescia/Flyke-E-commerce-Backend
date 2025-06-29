const { MercadoPagoConfig, Payment } = require('mercadopago');
const mercadopago = require("mercadopago");
require('dotenv').config();

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN

mercadopago.configure({
    access_token: MP_ACCESS_TOKEN,
})

async function CreatePreferenceId(req, res) {
    const { cartItems, user } = req.body;

    const items = cartItems.map(item => ({
        id: item.id?.toString() || 'item-id',
        title: item.title,
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: "ARS"
    }));

    const preference = {
        items,
        payer: user?.email ? { email: user.email } : undefined,
        back_urls: {
            success: "https://tu-dominio.com/success",
            failure: "https://tu-dominio.com/failure",
            pending: "https://tu-dominio.com/pending",
        },
        auto_return: "approved"
    };

    try {
        const response = await mercadopago.preferences.create(preference);
        const preferenceId = response.body.id;
        return res.status(200).json({ preferenceId });
    } catch (error) {
        console.error("Error al crear preferencia:", error);
        return res.status(500).json({ error: "No se pudo crear la preferencia" });
    }
}

async function createPayment(req, res) {
    const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });
    const payment = new Payment(client);

    try {
        const result = await payment.create({ body: req.body });
        return res.status(200).json({ status: result.body.status, id: result.body.id });
    } catch (error) {
        console.error("Error al procesar pago", error);
        return res.status(500).json({ error: "No se pudo procesar el pago" });
    }
}

module.exports = {
    CreatePreferenceId,
    createPayment
};