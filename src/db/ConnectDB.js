const mongoose = require('mongoose')
require('dotenv').config();



const ConnectDB = async ()=>{
    try{
       await mongoose.connect(process.env.MONGOOSE_URI)
    } catch(error){
        console.error('Failed to connect database')
        process.exit(0);
    }
}

module.exports = ConnectDB;