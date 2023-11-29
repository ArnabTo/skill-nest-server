const mongoose = require('mongoose');

const addClassSchema = new mongoose.Schema({
    title: String,
    name: String,
    image: String,
    email: String,
    price: Number,
    discription: String,
    status: String,
    total_enrollment:Number,
    userId: String
});

const AddClass = mongoose.model('AddClass', addClassSchema, 'classCollection');
module.exports = AddClass;