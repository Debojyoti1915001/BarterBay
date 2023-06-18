const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const { v4 } = require('uuid');


const adminController = require('../controllers/adminController')


const { requireAuth, redirectIfLoggedIn } = require('../middleware/adminAuth')
router.get('/login',redirectIfLoggedIn, adminController.login_get)
router.post('/login', adminController.login_post)

module.exports = router