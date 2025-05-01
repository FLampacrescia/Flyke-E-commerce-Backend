const express = require('express');
const cors = require("cors");

const routes = require("./routes/index.js");

const app = express();

//Middlewares
//Middleware para manejar/leer el body de las peticiones
app.use(express.json());

// Leer archivos carpeta pública uploads
app.use(express.static("uploads"));

// Habilitamos los CORS para permitir el acceso a la API desde otros dominios.
app.use(cors());

app.use("/api", routes);


module.exports = app;