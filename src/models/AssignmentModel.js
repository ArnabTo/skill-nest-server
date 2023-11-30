const mongoose = require('mongoose');

const assignMentSchema = new mongoose.Schema({
     title: String,
     deadline: String,
     description: String,
     classId: String,
})

const Assignment = mongoose.model('Assignment', assignMentSchema, 'assignmentCollection');
module.exports = Assignment;