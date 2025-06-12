const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storeSchema = new Schema({
    name: String,
    lat: Number,
    lon: Number,
    address: String,
    neighborhood: String,
});

module.exports = mongoose.model("Store", storeSchema);