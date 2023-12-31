const mongoose = require('mongoose');

const allClassSchema = new mongoose.Schema({
    title: String,
    name: String,
    image: String,
    price: Number,
    email: String,
    discription: String,
    status: String,
    total_enrollment:Number,
    userId: String
});

const AllClass = mongoose.model('AllClass', allClassSchema, 'classCollection');
module.exports = AllClass;