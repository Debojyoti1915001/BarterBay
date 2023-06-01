const mongoose = require('mongoose')


const documentSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    document:[{
        originalName:{
            type:String
        },
        filename:{
            type:String
        }
    }],
    owner:{
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
