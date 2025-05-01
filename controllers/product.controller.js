const Product = require('../models/product.model');

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

        if(req.file) {
            product.image = req.file.filename;
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

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    deleteProductById,
    updateProductById
}