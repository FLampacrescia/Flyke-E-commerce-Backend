const Store = require("../models/store.model");

// Obtener todas las sucursales
async function getStores(req, res) {
    try {
        const stores = await Store.find();
        return res.status(200).send({
            message: "Stores fetched successfully",
            stores
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Error fetching stores" });
    }
}

// Agregar una nueva sucursal
async function addStore(req, res) {
    try {
        const { name, lat, lon } = req.body;

        if (!name || lat === undefined || lon === undefined) {
            return res.status(400).send({ message: "Missing required fields: name, lat, lon" });
        }

        // Verificar duplicados
        const existingStore = await Store.findOne({
            $or: [
                { name: name.trim() },
                { lat: lat, lon: lon }
            ]
        });

        if (existingStore) {
            return res.status(409).send({ message: "Store with same name or location already exists" });
        }

        const newStore = new Store({ name: name.trim(), lat, lon });
        const savedStore = await newStore.save();

        return res.status(201).send({
            message: "Store added successfully",
            store: savedStore
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Error adding store" });
    }
}

// Eliminar una sucursal por ID
async function deleteStore(req, res) {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).send({ message: "Missing store ID" });
        }

        const deletedStore = await Store.findByIdAndDelete(id);

        if (!deletedStore) {
            return res.status(404).send({ message: "Store not found" });
        }

        return res.status(200).send({
            message: "Store deleted successfully",
            store: deletedStore
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Error deleting store" });
    }
}

// Actualizar una sucursal existente
async function updateStore(req, res) {
    try {
        const { id } = req.params;
        const { name, lat, lon } = req.body;

        if (!name || lat === undefined || lon === undefined) {
            return res.status(400).send({ message: "Missing required fields: name, lat, lon" });
        }

        const existingStore = await Store.findOne({
            $and: [
                { _id: { $ne: id } }, // Excluir la tienda actual
                {
                    $or: [
                        { name: name.trim() },
                        { lat: lat, lon: lon }
                    ]
                }
            ]
        });

        if (existingStore) {
            return res.status(409).send({ message: "Another store with same name or location already exists" });
        }

        const updatedStore = await Store.findByIdAndUpdate(
            id,
            { name: name.trim(), lat, lon },
            { new: true }
        );

        if (!updatedStore) {
            return res.status(404).send({ message: "Store not found" });
        }

        return res.status(200).send({
            message: "Store updated successfully",
            store: updatedStore
        });

    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Error updating store" });
    }
}

module.exports = {
    getStores,
    addStore,
    deleteStore,
    updateStore,
};