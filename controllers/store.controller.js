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
        const { name, address, neighborhood, province, timetable } = req.body;

        if (!name || !address || !neighborhood || !province || !timetable) {
            return res.status(400).send({ message: "Missing required store fields" });
        }

        const existingStore = await Store.findOne({ name: name.trim(), address: address.trim() });
        if (existingStore) {
            return res.status(409).send({ message: "Store with same name and address already exists" });
        }

        const newStore = new Store({ name: name.trim(), address, neighborhood, province, timetable });
        const savedStore = await newStore.save();

        return res.status(201).send({
            message: "Store added successfully",
            store: savedStore,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Error adding store" });
    }
}

// Eliminar una sucursal por ID
async function deleteStoreById(req, res) {
    try {
        const { id } = req.params; // ← corregido

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
async function updateStoreById(req, res) {
    try {
        const { id } = req.params;
        const { name, address, neighborhood, province, timetable } = req.body;

        // Validar campos obligatorios
        if (!name || !address || !neighborhood || !province || !timetable) {
            return res.status(400).send({ message: "Missing required fields" });
        }

        // Verificar duplicados (exceptuando la tienda actual)
        const existingStore = await Store.findOne({
            _id: { $ne: id },
            name: name.trim(),
            address: address.trim()
        });

        if (existingStore) {
            return res.status(409).send({ message: "Another store with same name and address already exists" });
        }

        // Actualizar tienda
        const updatedStore = await Store.findByIdAndUpdate(
            id,
            {
                name: name.trim(),
                address: address.trim(),
                neighborhood,
                province,
                timetable
            },
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
    deleteStoreById,
    updateStoreById,
};