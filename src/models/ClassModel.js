const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    title: String,
    name: String,
    image: String,
    price: Number,
    shortDescription: String,
    totalEnrollment: Number,
});

const Class = mongoose.model('Class', classSchema, 'classCollection');
module.exports = Class;