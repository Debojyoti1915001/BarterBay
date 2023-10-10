const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const { v4 } = require('uuid');
const multer = require('multer')
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // console.log("in multer",file)
        if (file.fieldname === 'photo') {
            const userEmail = req.user.email.toLowerCase()
            var dir = `./public/uploads/${userEmail}/${file.fieldname}`
        }
        if (!fs.existsSync(dir)) {
            //console.log("making files")
            fs.mkdirSync(dir, { recursive: true }, (err) => {
                if (err) console.error('New Directory Creation Error');
            })
        }
        cb(null, dir)
    },
    filename: (req, file, cb) => {
        cb(null, `File-${v4()}-${file.originalname}`)
    },
})

const upload = multer({
    storage: storage,
    limits: { fileSize: 6000000 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb)
    },
})
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif|pdf/
    const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
    )
    const mimetype = filetypes.test(file.mimetype)
    if (mimetype && extname) {
        return cb(null, true)
    } else {
        console.log("invalid file")
        // req.flash("error_msg", "Enter a valid picture of format jpeg jpg png") 
        return cb(null, false)
    }
}


//uploading finishes
const authController = require('../controllers/authControllers')
const { requireAuth, redirectIfLoggedIn } = require('../middleware/userAuth')
router.get('/verify/:id', authController.emailVerify_get)
router.get('/signup', redirectIfLoggedIn, authController.signup_get)
router.post('/signup', authController.signup_post)
router.get('/login', redirectIfLoggedIn, authController.login_get)
router.post('/login', authController.login_post)
router.get('/logout', requireAuth, authController.logout_get)

router.post('/createPost', requireAuth, upload.single('photo'), authController.createPost)



router.get('/forgotPassword', redirectIfLoggedIn, authController.getForgotPasswordForm)
router.post('/forgotPassword', redirectIfLoggedIn, authController.forgotPassword)
router.get('/resetPassword/:id/:token', authController.getPasswordResetForm)
router.post('/resetPassword/:id/:token', authController.resetPassword)
router.post('/rate/:id', requireAuth, authController.ratings_post)

router.post('/search', authController.search_post)
router.get('/search/:id', authController.tag_post)
router.get('/post/:id',requireAuth, authController.post_get)
router.get('/deals/:type',requireAuth, authController.myDeals_get)
router.get('/delete/:id',requireAuth, authController.delete_get)
router.post('/comment/:id',requireAuth ,authController.comment_post)
router.get('/chat/:id/:postId',requireAuth, authController.chat_get)
router.post('/chat/:id/:postId',requireAuth, authController.chat_post)
router.get('/message/:id',requireAuth, authController.users_get)
router.post('/barter/:id',requireAuth, authController.barter_post)
router.get('/accept/:id1/:id2',requireAuth, authController.accept_get)
router.get('/profile',requireAuth, authController.user_get)
router.get('/buy/:id',requireAuth, authController.buy_get)
router.post('/credits/:id',requireAuth, authController.credits_post)
router.post('/perhour/:id',requireAuth, authController.perhour_post)
router.get('/acceptCredits/:id/:id1/:id2',requireAuth, authController.acceptCredits_get)


module.exports = router