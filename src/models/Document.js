const mongoose = require('mongoose')


const documentSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    hour: {
        type: Number,
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
    }],
    credits:[{
        type: mongoose.Schema.Types.ObjectId ,
        ref:'Credits'
    }],
    perhour:[{
        type: mongoose.Schema.Types.ObjectId ,
        ref:'Perhour'
    }],
    score: {
        type: Number,
        trim: true,
        default:0
    },
    perhour: {
        type: Number,
        trim: true,
        default:0
    },
    boughtByArray:[{
        type: mongoose.Schema.Types.ObjectId ,
        ref:'Perhour'
    }]
})

/*diseaseSchema.virtual('owner',{
    ref:'User',
    localField:'_id',
    foreignField:'disease'
})*/

const Document = mongoose.model('Document', documentSchema)

module.exports = Document
