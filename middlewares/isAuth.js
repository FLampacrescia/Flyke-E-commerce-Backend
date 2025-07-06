const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET_JWT;

function isAuth(req, res, next) {
    const token = req.headers.access_token;

    if (!token) {
        return res.status(401).send("No tienes acceso a esta ruta.");
    }

    jwt.verify(token, SECRET, (error, decoded) => {
        if (error) {
            return res.status(401).send("Token Inválido.");
        }

        if (!decoded._id && decoded.id) {
            decoded._id = decoded.id;
        }

        req.user = decoded;
        next();
    });
}

function isAdmin(req, res, next) {
    if (req.user.role !== "admin") {
        return res.status(403).send("No tienes permiso para acceder a esta ruta.");
    }
    next();
}

function canEditUser(req, res, next) {
    const { id } = req.params;
    const loggedInUser = req.user;

    if (loggedInUser.role === "admin") {
        return next();
    }

    if (loggedInUser.id === id) {
        return next();
    }

    return res.status(403).send("No tienes permiso para modificar esta cuenta.");
}

module.exports = { isAuth, isAdmin, canEditUser };