const express = require('express')
const router = express.Router()
const { contactMail } = require('../config/nodemailer');
//Route for homepage
router.get('/', (req, res) => {
    res.render('./userViews/index')
});



module.exports = router
