const User = require('../models/User')
const jwt = require('jsonwebtoken')
const path = require('path')
require('dotenv').config()

const maxAge = 30 * 24 * 60 * 60

const cloudinary = require('cloudinary').v2
cloudinary.config({
    cloud_name: "dxjcjsopt",
    api_key: "776272262761276",
    api_secret: "ZvhJVjaKl4CTKyDJIN-xKfNOit4"
});

module.exports.dashboard_get = async (req, res) => {
    const user=await User.find({})
    res.render('./admin/dashboard',{
        user
    })
}
module.exports.credit_get = async (req, res) => {
    const id=req.params.id
    const user=await User.findOne({_id:id})
    var score=user.score+parseInt(req.body.score)
    console.log(score)
    const doc = await User.findOneAndUpdate({ _id: id }, { $set: { score } }, { new: true }, (err, doc) => {
        if (err) {
            res.send(err)
        }
    });
    res.redirect('/admin/dashboard')
}
module.exports.login_get = async (req, res) => {
    res.render('./admin/login')
}
module.exports.login_post = async (req, res) => {
    const { name, password } = req.body
    console.log(res.body, process.env.name, process.env.password)
    if (name == 'admin' && password == 'admin') {

        res.cookie('admin', 'admin', { httpOnly: true, maxAge: maxAge * 1000 })
        res.redirect('/admin/dashboard')
    } else
        res.redirect('/admin/login')
}
