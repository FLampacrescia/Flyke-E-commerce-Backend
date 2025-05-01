const app = require("./app.js");

const mongoose = require("mongoose");

const PORT = 3000;

const mongo_uri = "mongodb+srv://user1:P!8K.wwFZL7UyXw@eit-flyke-ecommerce.twsqylh.mongodb.net/ecommerce?retryWrites=true&w=majority"

mongoose.connect(mongo_uri).then(() => {
                      console.log("Conectado a la DB");
                      
                      app.listen(PORT, () => {
                        console.log(`Servidor funcionando en el puerto ${PORT}`);
                    })
                  })
                    .catch((error) => {
                      console.log("Error al conectar a la DB", error);
                    })