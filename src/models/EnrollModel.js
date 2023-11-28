const mongoose = require('mongoose');

const enrollSchema = new mongoose.Schema({
    email: String,
    enrolledClassid: String,
})

const Enroll = mongoose.model('Enroll', enrollSchema, 'enrollCollection');
module.exports = Enroll;