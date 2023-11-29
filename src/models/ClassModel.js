const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    title: String,
    email: String,
    name: String,
    image: String,
    email: String,
    price: Number,
    shortDescription: String,
    total_enrollment: Number,
    userId: String
});

const Class = mongoose.model('Class', classSchema, 'classCollection');
module.exports = Class;