const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    email: String,
    name: String,
    image: String,
    experience: String,
    category: String,
    status:String
})

const TeachReq = mongoose.model('TeachReq', teacherSchema, 'teaReqCollection');
module.exports = TeachReq;