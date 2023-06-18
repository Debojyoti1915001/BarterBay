const mongoose = require('mongoose')


const commentSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    desc:{
        type: String,
        trim: true,
    },
    user:{
        type: mongoose.Schema.Types.ObjectId ,
        ref:'User'
    },
})


const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment
