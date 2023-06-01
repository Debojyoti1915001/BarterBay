const nodemailer = require('nodemailer')
require('dotenv').config()
const jwt = require('jsonwebtoken')

const signupMail = (data, host, protocol) => {
    const maxAge = 3 * 60 * 60

    const TOKEN = jwt.sign({ id: data._id }, process.env.JWT_SECRET, {
        expiresIn: maxAge,
    })
    const PORT = process.env.PORT || 3000
    const link = `${protocol}://${host}:${PORT}/user/verify/${data._id}?tkn=${TOKEN}`

    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.NODEMAILER_EMAIL, //email id

            pass: process.env.NODEMAILER_PASSWORD, // gmail password
        },
    })
    var mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: `${data.email}`,
        subject: 'Please confirm your Email account',
        html:
            'Hello,<br> Please here to verify your email.<br><a href=' +
            link +
            '>Click here to verify</a>',
    }
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log('Error', error)
        } else {
            console.log('Email sent: ')
        }
    })
}
const passwordMail = (user, TOKEN, host, protocol) => {
    const PORT = process.env.PORT || 3000
    const link = `${protocol}://${host}:${PORT}/user/resetPassword/${user._id}/${TOKEN}`

    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.NODEMAILER_EMAIL, //email id

            pass: process.env.NODEMAILER_PASSWORD, // gmail password
        },
    })
    var mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: `${user.email}`,
        subject: 'Give access to change your password',
        html:
            'Hello,<br> Please click here to give change your password.<br><a href=' +
            link +
            '>Click here </a>',
    }
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log('Error', error)
        } else {
            console.log('Email sent: ')
        }
    })
}



module.exports = {
    signupMail,
    passwordMail,
}
