const mongoose = require('mongoose');

const feedBackSchema = new mongoose.Schema({
     name:String,
     image: String,
     feedback: String,
     classId: String,
     rating: Number
})

const feedBack = mongoose.model('FeedBack', feedBackSchema, 'feedBackCollection');
module.exports = feedBack;