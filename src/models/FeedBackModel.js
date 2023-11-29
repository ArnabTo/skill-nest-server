const mongoose = require('mongoose');

const feedBackSchema = new mongoose.Schema({
     name:String,
     image: String,
     title: String,
     feedback: String,
     classId: String,
})

const feedBack = mongoose.model('FeedBack', feedBackSchema, 'feedBackCollection');
module.exports = feedBack;