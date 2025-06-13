const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storeSchema = new Schema({
    name: String,
    address: String,
    neighborhood: String,
    province: String,
    timetable: String
});

module.exports = mongoose.model("Store", storeSchema);