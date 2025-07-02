const productRouter = require("./product.routes");
const userRouter = require("./user.routes");
const categoryRouter = require("./category.routes");
const orderRouter = require ('./order.routes');
const storeRouter = require ('./store.routes');


module.exports = [ productRouter, userRouter, categoryRouter, orderRouter, storeRouter, mercadoPagoRouter ]