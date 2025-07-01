require('dotenv').config();

const app = require("./app.js");

const mongoose = require("mongoose");

const PORT = process.env.PORT || 3000;
const URI = process.env.MONGO_URI

mongoose.connect(URI).then(() => {
                      console.log("Conectado a la DB");
                      
                      app.listen(PORT, () => {
                        console.log(`Servidor funcionando en el puerto ${PORT}`);
                    })
                  })
                    .catch((error) => {
                      console.log("Error al conectar a la DB", error);
                    })