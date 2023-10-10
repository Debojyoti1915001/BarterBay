const mongoose = require('mongoose')


const perhourSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    amount:{
        type: String,
        trim: true,
    },
    user:{
        type: mongoose.Schema.Types.ObjectId ,
        ref:'User'
    },
})


const Perhour = mongoose.model('Perhour', perhourSchema)

module.exports = Perhour
