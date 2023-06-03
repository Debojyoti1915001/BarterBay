const mongoose = require('mongoose')


const documentSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    desc:{
        type: String,
        trim: true,
    },
    url:{
        type: String,
        trim: true,
    },
    user:{
        type: mongoose.Schema.Types.ObjectId ,
        ref:'User'
    }
})

/*diseaseSchema.virtual('owner',{
    ref:'User',
    localField:'_id',
    foreignField:'disease'
})*/

const Document = mongoose.model('Document', documentSchema)

module.exports = Document
