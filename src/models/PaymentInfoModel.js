const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    email: String,
    price: Number,
    date: String,
    classCartId: String,
    transactionid:String,
    status: String
})
const Payment = mongoose.model('Payment', paymentSchema, 'payhistoryCollectoin');
module.exports = Payment;