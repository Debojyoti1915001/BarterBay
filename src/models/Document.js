const mongoose = require('mongoose')


const documentSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    id:{
        type: String,
        trim: true,
    },
    active: {
        type: Boolean,
        default:true,
    },
    desc:{
        type: String,
        trim: true,
    },
    url:{
        type: String,
        trim: true,
    },
    type:{
        type: String,
        trim: true,
    },
    deals:[{
        type: mongoose.Schema.Types.ObjectId ,
        ref:'Document'
    }],
    ratings:[
        {
            type:Number,
            trim:true,
        }
    ],
    tags:[
        {
            type:String,
            trim:true,
        }
    ],
    user:{
        type: mongoose.Schema.Types.ObjectId ,
        ref:'User'
    },
    boughtBy:{
        type: mongoose.Schema.Types.ObjectId ,
        ref:'User'
    },
    comment:[{
        type: mongoose.Schema.Types.ObjectId ,
        ref:'Comment'
    }]
})

/*diseaseSchema.virtual('owner',{
    ref:'User',
    localField:'_id',
    foreignField:'disease'
})*/

const Document = mongoose.model('Document', documentSchema)

module.exports = Document
