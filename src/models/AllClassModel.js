const mongoose = require('mongoose');

const allClassSchema = new mongoose.Schema({
    title: String,
    name: String,
    image: String,
    price: Number,
    shortDescription: String,
    totalEnrollment: Number,
});

const AllClass = mongoose.model('AllClass', allClassSchema, 'classCollection');
module.exports = AllClass;