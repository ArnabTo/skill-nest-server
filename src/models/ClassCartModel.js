const mongoose = require('mongoose')

const classCartSchema = new mongoose.Schema({
    email: String,
    price: Number,
    classTitle: String,
    classId: String
})

const ClassCart = mongoose.model('ClassCart', classCartSchema, 'classCartCollection')
module.exports = ClassCart;