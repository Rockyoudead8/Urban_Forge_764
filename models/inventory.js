const mongoose = require("mongoose")

mongoose.connect("mongodb://127.0.0.1:27017/beyonce_botique")

const inventoryschema = mongoose.Schema({
    image: String,
    productname: String,
    productid: String,
    price: Number,
    quantity: Number,
    category: String,
    size: String,
    description: String,
    story: String
})

module.exports = mongoose.model("inventory", inventoryschema)