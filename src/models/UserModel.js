const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:String,
    image: String,
    email: String
})

const User = mongoose.model('User', userSchema, 'userCollection');
module.exports = User;