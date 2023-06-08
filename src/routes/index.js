const express = require('express')
const router = express.Router()
const { contactMail } = require('../config/nodemailer');
//Route for homepage
router.get('/', (req, res) => {
    const token=req.cookies.jwt
    var isLoggedIn=false
    if(token){
        isLoggedIn=true
    }
    res.render('./userViews/index',{
        isLoggedIn
    })
});



module.exports = router
