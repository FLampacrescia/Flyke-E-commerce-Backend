const Product = require('../models/product.model');
const User = require('../models/user.model');

async function getProducts(req, res) {
    try {
        const products = await Product.find({});

        return res.status(200).send({
            message: "Productos obtenidos correctamente.",
            products
        });
    } catch (error) {
        console.error(error)
        res.status(500).send({ message: 'Error al obtener los productos.' })
    }
}

async function getProductById(req, res) {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado." });
        }
        return res.status(200).json(product);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al obtener el producto." });
    }
}

async function createProduct(req, res) {
    try {
        const product = new Product(req.body);

        if (req.file) {
            product.image = req.file.filename;
        }

        if (!req.file) {
            return res.status(400).json({ message: "No se subió ninguna imagen." });
        }

        const newProduct = await product.save();

        return res.status(201).send({
            message: 'Producto creado correctamente',
            product: newProduct
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error al crear el producto.' });
    }
}

async function deleteProductById(req, res) {
    try {
        const productId = req.params.id;
        const deleted = await Product.findByIdAndDelete(productId);
        if (!deleted) {
            return res.status(404).send({ message: "Producto no encontrado." });
        }
        return res
            .status(200)
            .send({ message: `Producto "${deleted.title}" eliminado.`, product: deleted });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Error al eliminar el producto." });
    }
}

async function updateProductById(req, res) {
    try {
        const productId = req.params.id;
        const data = { ...req.body };

        if (req.file) {
            data.image = req.file.filename;
        }

        const updated = await Product.findByIdAndUpdate(productId, data, { new: true });
        if (!updated) {
            return res.status(404).send({ message: "Producto no encontrado." });
        }
        return res
            .status(200)
            .send({ message: "Producto actualizado correctamente.", product: updated });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Error al actualizar el producto." });
    }
}

// Obtener wishlist del usuario
async function getUserWishlist(req, res) {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).populate('wishlist');

        if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

        return res.status(200).json({
            message: 'Wishlist obtenida correctamente.',
            wishlist: user.wishlist
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener la wishlist.' });
    }
}

// Agregar producto a la wishlist
async function addToWishlist(req, res) {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

        if (!user.wishlist.includes(productId)) {
            user.wishlist.push(productId);
            await user.save();
        }

        const updatedUser = await User.findById(userId).populate("wishlist");

        return res.status(200).json({
            message: 'Producto agregado a la wishlist.',
            wishlist: updatedUser.wishlist
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al agregar a wishlist.' });
    }
}

// Eliminar producto de la wishlist
async function removeFromWishlist(req, res) {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        await user.save();

        const updatedUser = await User.findById(userId).populate("wishlist");

        return res.status(200).json({
            message: 'Producto eliminado de la wishlist.',
            wishlist: updatedUser.wishlist
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al eliminar de wishlist.' });
    }
}

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    deleteProductById,
    updateProductById,
    getUserWishlist,
    addToWishlist,
    removeFromWishlist
}