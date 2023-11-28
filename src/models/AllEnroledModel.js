const mongoose = require('mongoose');

const allenrollSchema = new mongoose.Schema({
    email: String,
    title: String,
    name: String,
    image: String,
    disc: String,
})

const AllEnroll = mongoose.model('AllEnroll', allenrollSchema, 'allenrollCollection');
module.exports = AllEnroll;