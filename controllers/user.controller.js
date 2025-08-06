const User = require("../models/user.model");
const Order = require("../models/order.model");

const bcrypt = require("bcryptjs");
const salt = 10;
const jwt = require("jsonwebtoken");
const fs = require("fs");
const SECRET = process.env.SECRET_JWT;

// Obtener usuarios
async function getUsers(req, res) {
  try {

    const searchName = new RegExp(req.query.name, "i");
    
    const users = await User.find({
      name: searchName
    });
    return res.status(200).send({
            message: "Usuarios obtenidos correctamente.",
            users
        });

  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener los usuarios.")
  }
};

// Obtener usuario por ID
async function getUserById(req, res) {
  try {
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
const updateUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, lastName, email, dni } = req.body;

    const updateFields = {
      ...(name && { name }),
      ...(lastName && { lastName }),
      ...(email && { email }),
      ...(dni && { dni }),
      updatedAt: Date.now(),
    };

    const userUpdated = await User.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!userUpdated) {
      return res.status(404).send({ message: "El usuario no se puede actualizar." });
    }

    return res.status(200).send({
      message: "Usuario actualizado correctamente.",
      user: userUpdated,
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return res.status(500).send({
      message: "Error al intentar actualizar el usuario.",
    });
  }
};

// Actualizar la foto de perfil del usuario
async function updateProfileImage(req, res) {
  try {
    const id = req.params.id;
    const file = req.file;

    if (!file) {
      return res.status(400).send({
        message: "No se subió ninguna imagen."
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send({
        message: "No se encontró el usuario."
      });
    }

    // Eliminar imagen anterior si existe
    if (user.profileImage) {
      const oldImagePath = `uploads/${user.profileImage}`;
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Guardar nueva ruta relativa
    user.profileImage = `users/${file.filename}`;
    await user.save();

    return res.status(200).send({
      message: "Imagen de perfil actualizada correctamente.",
      profileImage: user.profileImage
    });

  } catch (error) {
    console.error(error);
    return res.status(500).send({
      message: "Error al actualizar la imagen de perfil."
    });
  }
}

// Agregar una dirección
async function addAddress(req, res) {
  try {
    const { userId } = req.params;
    const newAddress = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    if (newAddress.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({ message: "Dirección agregada correctamente", addresses: user.addresses });
  } catch (error) {
    console.error("Error al agregar dirección:", error);
    res.status(500).json({ message: "Error al agregar dirección" });
  }
}

// Actualizar una dirección por ID
async function updateAddressById(req, res) {
  try {
    const { userId, addressId } = req.params;
    const updatedData = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const address = user.addresses.id(addressId);
    if (!address) return res.status(404).json({ message: "Dirección no encontrada" });

    Object.keys(updatedData).forEach(key => {
      address[key] = updatedData[key];
    });

    await user.save();
    return res.status(200).json({ message: "Dirección actualizada con éxito", address });
  } catch (error) {
    console.error("Error al actualizar dirección:", error);
    return res.status(500).json({ message: "Error al actualizar la dirección" });
  }
}

// Eliminar una dirección
async function deleteAddress(req, res) {
  try {
    const { userId, addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const addressDeleted = await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { addresses: { _id: addressId } } },
      { new: true }
    );

if (!addressDeleted) {
      return res.status(404).json({ message: "No se pudo eliminar la dirección." });
    }

    return res.status(200).json({ message: "Dirección eliminada correctamente", user: addressDeleted });

  } catch (error) {
    console.error("Error al eliminar la dirección:", error);
    res.status(500).json({ message: "Error al eliminar la dirección." });
  }
}

// Establecer una dirección como principal o "default"
async function setDefaultAddress(req, res) {
  try {
    const { userId, addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    user.addresses.forEach(addr => {
      addr.isDefault = addr._id.toString() === addressId;
    });

    await user.save();

    res.status(200).json({ message: "Dirección principal actualizada correctamente", addresses: user.addresses });
  } catch (error) {
    console.error("Error actualizando dirección principal:", error);
    res.status(500).json({ message: "Error al actualizar la dirección principal" });
  }
}

// Obtener todas las órdenes del usuario
async function getUserOrders(req, res) {
  try {
    const userId = req.params.userId;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("products.product", "title price image")
      .populate("store", "name address neighborhood province");

    return res.status(200).send(orders);

  } catch (error) {
    console.error(error);
    return res.status(500).send({
      message: "Error al obtener las órdenes del usuario."
    });
  }
}

// Obtener una órden especifica por ID
async function getUserOrderById(req, res) {
  try {
    const { userId, orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate("items.product");

    if (!order) {
      return res.status(404).send({ message: "Orden no encontrada." });
    }

    return res.status(200).send(order);

  } catch (error) {
    console.error(error);
    return res.status(500).send({
      message: "Error al obtener el detalle de la orden."
    });
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
            { expiresIn: "15m" }
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
  updateProfileImage,
  addAddress,
  updateAddressById,
  deleteAddress,
  setDefaultAddress,
  getUserOrders,
  getUserOrderById,
  loginUser
}