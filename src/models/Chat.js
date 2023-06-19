const mongoose = require('mongoose')


const chatSchema = mongoose.Schema({
    message: {
        type: String,
        trim: true,
    },
    sender:{
        type: mongoose.Schema.Types.ObjectId ,
        ref:'User'
    },
    document:{
        type: mongoose.Schema.Types.ObjectId ,
        ref:'Document'
    },
    reciever:{
        type: mongoose.Schema.Types.ObjectId ,
        ref:'User'
    },
    time:Number,
})


const Chat = mongoose.model('Chat', chatSchema)

module.exports = Chat
