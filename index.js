require('dotenv').config();

const app = require("./app.js");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 3000;

const isProduction = process.env.NODE_ENV === "production";

const URI = isProduction ? process.env.MONGO_URI_PROD : process.env.MONGO_URI_DEV;

mongoose.connect(URI)
  .then(() => {
    console.log("Conectado a la DB:", isProduction ? "Producción" : "Desarrollo");

    app.listen(PORT, () => {
      console.log(`Servidor funcionando en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error al conectar a la DB", error);
  });