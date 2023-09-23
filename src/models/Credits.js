const mongoose = require('mongoose')


const creditsSchema = mongoose.Schema({
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


const Credits = mongoose.model('Credits', creditsSchema)

module.exports = Credits
