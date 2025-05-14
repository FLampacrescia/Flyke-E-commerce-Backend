const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET_JWT

function isAuth(req, res, next) {
    const token = req.headers.access_token;

    if(!token) {
        return res.status(401).send("No tienes acceso a esta ruta.");
    }

    jwt.verify(token, SECRET, (error, decoded) => {

        if(error) {
            return res.status(401).send("Token Inválido.");
        }

        req.user = decoded;

        next()
    })
}

function isAdmin(req, res, next) {
    const token = req.headers.access_token;

    if(!token) {
        return res.status(401).send("No tienes acceso a esta ruta.");
    }

    jwt.verify(token, SECRET, (error, decoded) => {

        if(error) {
            return res.status(401).send("Token Inválido.");
        }

        req.user = decoded;

        if (decoded.role !== "admin") {
            return res.status(403).send("No tienes permiso para acceder a esta ruta.")
        }

        next()
    })
}

module.exports = { isAuth, isAdmin };