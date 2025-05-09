const productRouter = require("./product.routes");
const userRouter = require("./user.routes");
const categoryRouter = require("./category.routes");
const orderRouter = require ('./order.routes');


module.exports = [ productRouter, userRouter, categoryRouter, orderRouter ]