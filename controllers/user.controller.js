const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const salt = 10;
const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET_JWT;

// Obtener usuarios
async function getUsers(req, res) {
  try {

    const searchName = new RegExp(req.query.name, "i");
    
    const users = await User.find({
      name: searchName
    });
    return res.status(200).send(users)

  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener los usuarios.")
    
  }
};

// Obtener usuario por ID
async function getUserById(req, res) {
  try {
    console.log("Petición recibida al controller");
    const id = req.params.id
    const user = await User.findById(id).select({ password: 0, __v: 0 });

    if (!user) {
      return res.status(404).send({
        message: "No se encontró el usuario."
      })
    }

    return res.status(200).send({
      message: "Se obtuvo el usuario correctamente.",
      user
    })
  } catch (error){
    console.log(error);
    res.status(500).send({
      message: "Error al obtener usuario."
    })
  }
  
}

// Creación de usuario
async function createUser(req, res) {
  try {
    const token = req.headers["access_token"];
    let finalRole = "user"; // Valor por defecto

    // Si viene un token, validarlo y verificar si es admin
    if (token) {
      try {
        const decoded = jwt.verify(token, SECRET);
        if (decoded.role === "admin") {
          finalRole = req.body.role || "user"; // Admin puede asignar rol
        } else {
          return res.status(403).send({ message: "No autorizado para crear usuarios." });
        }
      } catch (error) {
        return res.status(401).send({ message: "Token inválido." });
      }
    }
    // Si no hay token, finalRole queda como "user"

    // Validaciones de email y DNI duplicado
    const existingEmail = await User.findOne({ email: req.body.email });
    if (existingEmail) {
      return res.status(400).send({ message: "El correo electrónico ya está registrado." });
    }

    const existingDni = await User.findOne({ dni: req.body.dni });
    if (existingDni) {
      return res.status(400).send({ message: "El DNI ya está registrado." });
    }

    // Crear usuario y hashear contraseña
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const user = new User({
      ...req.body,
      role: finalRole,
      password: hashedPassword,
    });

    const newUser = await user.save();
    newUser.password = undefined; // no exponer contraseña

    return res.status(201).send({
      message: "Usuario creado correctamente.",
      user: newUser,
    });

  } catch (error) {
    console.log(error);
    res.status(500).send("Error al crear el usuario.");
  }
}

// Eliminar usuario por ID
async function deleteUserById(req, res) {
  try {
    const id = req.params.id;
    const userDeleted = await User.findByIdAndDelete(id)

    if(!userDeleted) {
      return res.status(404).send({
        message: "No se pudo eliminar el usuario."
      })
    }

    return res.status(200).send({ message: `El usuario ${userDeleted.name} se eliminó correctamente.`});
  } catch (error){
    console.log(error);
    res.status(500).send({ message: "Error al eliminar el usuario." })
  }
}

// Actualizar usuario por ID
async function updateUserById(req, res) {
  try {
    const id = req.params.id;
    const data = req.body;
    
    data.password = undefined;
    data.updatedAt = Date.now();

    const userUpdated = await User.findByIdAndUpdate(id, data, {new: true})
    console.log(userUpdated);
    
    if(!userUpdated) {
      return res.status(404).send({
        message: "El usuario no se puede actualizar."
      })
    }

    return res.status(200).send({
      message: "Usuario actualizado correctamente.",
      user: userUpdated
    })
    
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Error al intentar actualizar el usuario."
    })
  }
}

// Login del usuario
async function loginUser(req, res) {
  try {
    // 1- Recibimos desde la app un email y un password: "test@gmail.com - password1234"
    const { email, password } = req.body;

    // a - Si no llega email o password, retornamos un error 400.
    if (!email || !password) {
      return res.status(400).send({
        message: "El email y la contraseña son necesarios."
      })
    }
    // 2- Vamos a buscar en nuestra DB si tenemos un usuario con dicho email
    const user = await User.findOne({ email });
    
      // a - No existe el usuario (devolvemos 404)
      if (!user) {
        return res.status(404).send({
          message: "Credenciales incorrectas."
        })
      }
      // b - Existe y pasamos al punto 3
    // 3- Vamos a comparar la contraseña que me mandó el usuario con el password hasheado que tenemos en el usuario previamente obtenido.

    const isVerified = await bcrypt.compare(password, user.password);
      // a - Credenciales incorrectas, retornamos un error 401.
      if(!isVerified) {
        return res.status(401).send({
          message: "Credenciales incorrectas."
        })
      }

      user.password = undefined;

      // b - Vamos a establecer o generar un toekn para que el usuario pueda corroborar en futuras peticiones que es el mismo usuario que se logueó.

      // Los tokens se utilizan para autenticar a un usuario y verificar su identidad. En este caso vamos a utilizar JWT (JSON Web Token).
      const tokenPayload = {
            id: user._id.toString(),  // importante usar .toString() para evitar problemas
            role: user.role,
            email: user.email
        };

        const token = jwt.sign(
            tokenPayload,
            SECRET,
            { expiresIn: "1h" }
        );

      // 4- Retornamos el token y el usuario sin la contraseña.
      return res.status(200).send({
        message: "Login exitoso",
        user,
        token
    })

  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Error al realizar el login"
    })
    
  }
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  deleteUserById,
  updateUserById,
  loginUser
}