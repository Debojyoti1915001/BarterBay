const User = require('../models/User')
const Perhour = require('../models/Perhour')
const Document = require('../models/Document')
const Comment = require('../models/Comment')
const Chat = require('../models/Chat')
const Credits = require('../models/Credits')
const jwt = require('jsonwebtoken')
const { signupMail, passwordMail } = require('../config/nodemailer')
const path = require('path')
const { handleErrors } = require('../utilities/Utilities')
const crypto = require('crypto')
require('dotenv').config()
const { generateShortId } = require('../utilities/Utilities');
const { v4: uuidv4 } = require('uuid');
const maxAge = 30 * 24 * 60 * 60

const cloudinary = require('cloudinary').v2
cloudinary.config({
    cloud_name: "dxjcjsopt",
    api_key: "776272262761276",
    api_secret: "ZvhJVjaKl4CTKyDJIN-xKfNOit4"
});

// controller actions
module.exports.signup_get = (req, res) => {
    res.render('./userViews/signup', {
        type: 'signup',
    })
}

module.exports.login_get = (req, res) => {
    res.render('./userViews/login', {
        type: 'login',
    })
}

module.exports.signup_post = async (req, res) => {
    const { name, email, password, confirmPwd } = req.body

    const nominee = null
    console.log('in sign up route', req.body)
    if (password != confirmPwd) {
        req.flash('error_msg', 'Passwords do not match. Try again')
        res.status(400).redirect('/user/login')
        return
    }

    try {
        const userExists = await User.findOne({ email })
        console.log('userexists', userExists)
        /*if(userExists && userExists.active== false)
    {
      req.flash("success_msg",`${userExists.name}, we have sent you a link to verify your account kindly check your mail`)

      signupMail(userExists,req.hostname,req.protocol)
      return res.redirect("/signup")
    }*/
        if (userExists) {
            req.flash(
                'success_msg',
                'This email is already registered. Try logging in'
            )
            return res.redirect('/user/login')
        }
        // console.log('Short ID generated is: ', short_id)
        const user = new User({
            email,
            score:0,
            name,
            password,
            nominee,

        })
        let saveUser = await user.save()
        //console.log(saveUser);
        req.flash(
            'success_msg',
            'Registration successful. Check your inbox to verify your email'
        )
        signupMail(saveUser, req.hostname, req.protocol)
        //res.send(saveUser)
        res.redirect('/user/login')
    } catch (err) {
        const errors = handleErrors(err)
        console.log(errors)

        var message = 'Could not signup. '.concat(
            errors['email'] || '',
            errors['password'] || '',
            errors['phoneNumber'] || '',
            errors['name'] || ''
        )
        //res.json(errors);
        req.flash('error_msg', message)
        res.status(400).redirect('/user/signup')
    }
}
module.exports.emailVerify_get = async (req, res) => {
    try {
        const userID = req.params.id
        const expiredTokenUser = await User.findOne({ _id: userID })
        const token = req.query.tkn
        //console.log(token)
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                req.flash(
                    'error_msg',
                    ' Your verify link had expired. We have sent you another verification link'
                )
                signupMail(expiredTokenUser, req.hostname, req.protocol)
                return res.redirect('/user/login')
            }
            const user = await User.findOne({ _id: decoded.id })
            if (!user) {
                //console.log('user not found')
                res.redirect('/')
            } else {
                const activeUser = await User.findByIdAndUpdate(user._id, {
                    active: true,
                })
                if (!activeUser) {
                    // console.log('Error occured while verifying')
                    req.flash('error_msg', 'Error occured while verifying')
                    res.redirect('/')
                } else {
                    req.flash(
                        'success_msg',
                        'User has been verified and can login now'
                    )
                    //console.log('The user has been verified.')
                    //console.log('active', activeUser)
                    res.redirect('/user/login')
                }
            }
        })
    } catch (e) {
        console.log(e)
        //signupMail(user,req.hostname,req.protocol)
        res.redirect('/user/login')
    }
}

module.exports.login_post = async (req, res) => {
    const { email, password } = req.body
    // console.log('in Login route')
    // console.log('req.body',req.body)
    try {
        const user = await User.login(email, password)
        //console.log("user",user)

        const userExists = await User.findOne({ email })
        console.log("userexsits", userExists)

        if (!userExists.active) {
            const currDate = new Date()
            const initialUpdatedAt = userExists.updatedAt
            const timeDiff = Math.abs(
                currDate.getTime() - initialUpdatedAt.getTime()
            )
            if (timeDiff <= 10800000) {
                // console.log('Email already sent check it')
                req.flash(
                    'error_msg',
                    `${userExists.name}, we have already sent you a verify link please check your email`
                )
                res.redirect('/user/login')
                return
            }
            req.flash(
                'success_msg',
                `${userExists.name}, your verify link has expired we have sent you another email please check you mailbox`
            )
            signupMail(userExists, req.hostname, req.protocol)
            await User.findByIdAndUpdate(userExists._id, {
                updatedAt: new Date(),
            })
            //console.log('userExists',userExists)
            res.redirect('/user/login')
            return
        }

        const token = user.generateAuthToken(maxAge)

        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        //console.log(user);
        //signupMail(saveUser)
        // console.log("logged in")
        req.flash('success_msg', 'Successfully logged in')
        res.status(200).redirect('/')
    } catch (err) {
        req.flash('error_msg', 'Invalid Credentials')
        //console.log(err)
        res.redirect('/user/login')
    }
}

module.exports.profile_get = async (req, res) => {

    res.json(req.user)
    // console.log('in profile page')
}
module.exports.post_get = async (req, res) => {
    const id=req.params.id
    const _post=await Document.findOne({ _id: id})
    const post1=await _post.populate('comment').execPopulate()
    const post2=await post1.populate('credits').execPopulate()
    const user=req.user
    var isUser=false
    if(String(post1.user)==String(user._id)){
        isUser=true
    }
    
    const post=await post2.populate('deals').execPopulate()
    
    console.log(post)
    // await Document.findOneAndUpdate({ _id: post._id }, { $set: { deals:["649729c22f1b2c38ac2677fd"]} }, { new: true }, (err, doc) => {
    //     if (err) {
    //         res.redirect('/')
    //     }
    // });
    res.render('./userViews/post',
    {
        post,
        user,
        isUser
    }
    )
    // console.log('in profile page')
}
module.exports.createPost = async (req, res) => {
   try{
    const { name, desc, tags,type,score,perhour } = req.body
    console.log(req.body)
    const picture = req.file.path
    const tagsArray = []
    var cur = ""
    for (var i of tags) {
        if (i == " ") continue
        else if (i == ',') {
            tagsArray.push(cur)
            cur = ""
        } else {
            cur = cur + i
        }
    }
    if (cur.length) {
        tagsArray.push(cur)
    }
    const uniq="uploaded"+String(uuidv4())
    const result = await cloudinary.uploader.upload(picture, { public_id: uniq })
    // console.log(result.secure_url)

    const url = cloudinary.url(uniq, {
        width: 1500,
        height: 1000,
        Crop: 'fill'
    });
    console.log(url)
    const random=String(Math.floor(Math.random() * 10000))
    const name1=String(name)
    for(var i=0;i<name1.length;i++){
        if(name1[i]==' '){
            name1[i]='_'
        }
    }
    const id=name1+random
    const document = new Document({ name, desc, id,type,url, user: req.user._id, tags: tagsArray ,score,perhour})
    let saveDocument = await document.save()
    console.log(saveDocument)
    res.redirect('/')
   }catch(err){
    console.log(err)
   }
}

module.exports.logout_get = async (req, res) => {
    // res.cookie('jwt', '', { maxAge: 1 });
    // const cookie = req.cookies.jwt
    res.clearCookie('jwt')
    req.flash('success_msg', 'Successfully logged out')
    res.redirect('/user/login')
}

// module.exports.upload_get =async (req, res) => {
//   res.render("multer")
// }

module.exports.getForgotPasswordForm = async (req, res) => {
    res.render('./userViews/forgotPassword')
}

module.exports.getPasswordResetForm = async (req, res) => {
    const userID = req.params.id
    const user = await User.findOne({ _id: userID })
    const resetToken = req.params.token
    res.render('./userViews/resetPassword', {
        userID,
        resetToken,
    })
}

module.exports.forgotPassword = async (req, res) => {
    const email = req.body.email
    const user = await User.findOne({ email })
    if (!user) {
        req.flash('error_msg', 'No user found')
        return res.redirect('/user/login')
    }
    //console.log(user)
    const userID = user._id

    const dt = new Date(user.passwordResetExpires).getTime()
    if (
        (user.passwordResetToken && dt > Date.now()) ||
        !user.passwordResetToken
    ) {
        const resetToken = user.createPasswordResetToken()
        // console.log(user.passwordResetExpires)
        // console.log(user.passwordResetToken)
        await user.save({ validateBeforeSave: false })
        try {
            passwordMail(user, resetToken, req.hostname, req.protocol)
            req.flash('success_msg', 'Email sent,please check email')
            res.redirect('/user/forgotPassword')
        } catch (err) {
            user.passwordResetToken = undefined
            user.passwordResetExpires = undefined
            await user.save({ validateBeforeSave: false })
            req.flash('error_msg', 'Unable to send mail')
            res.redirect('/user/forgotPassword')
        }
    } else {
        req.flash(
            'error_msg',
            'Mail already send,please wait for sometime to send again'
        )
        res.redirect('/user/forgotPassword')
    }
}

module.exports.resetPassword = async (req, res) => {
    try {
        const token = req.params.token
        const id = req.params.id
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex')
        const user = await User.findOne({
            _id: req.params.id,
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        })
        if (!user) {
            req.flash('error_msg', 'No user found')
            return res.redirect('/user/login')
        }
        if (req.body.password !== req.body.cpassword) {
            req.flash('error_msg', 'Passwords dont match')
            return res.redirect(`resetPassword/${id}/${token}`)
        } else {
            user.password = req.body.password
            user.passwordResetToken = undefined
            user.passwordResetExpires = undefined
            await user.save()
            const JWTtoken = await user.generateAuthToken(maxAge)
            // user = user.toJSON()
            res.cookie('jwt', JWTtoken, {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: false,
            })
            res.redirect('/')
        }
    } catch (err) {
        res.send(err)
    }
}

module.exports.ratings_post = async (req, res) => {
    const val = req.body.rate
    console.log(req.body)
    const id = req.params.id
    const document = await Document.findOne({ _id: id })
    var ratings = document.ratings
    if (ratings.length == 0) {
        ratings = [0, 0, 0, 0, 0]
    }
    ratings[val-1]++
    const doc = await Document.findOneAndUpdate({ _id: id }, { $set: { ratings } }, { new: true }, (err, doc) => {
        if (err) {
            res.redirect('/')
        }
    });
    res.redirect('/')
}

module.exports.search_post = async (req, res) => {
    const search = req.body.search
    const allDocument = await Document.find({active:true})
    const document = []
        for (var i of allDocument) {
            var isPresent = false
            for (var j of i.tags) {
                if (j == search) {
                    isPresent = true;
                    break;
                }
            }
            if (i.name == search || isPresent) {
                document.push(i);
            }
        }
    console.log(document)
    const token=req.cookies.jwt
    var isLoggedIn=false
    if(token){
        isLoggedIn=true
    }
    res.render('./userViews/searchPost',{
        isLoggedIn,
        document
    })
}

module.exports.tag_post = async (req, res) => {
    const search = req.params.id
    const allDocument = await Document.find({active:true})
    const document = []
        for (var i of allDocument) {
            var isPresent = false
            for (var j of i.tags) {
                if (j == search) {
                    isPresent = true;
                    break;
                }
            }
            if (i.name == search || isPresent) {
                document.push(i);
            }
        }
    console.log(document)
    const token=req.cookies.jwt
    var isLoggedIn=false
    if(token){
        isLoggedIn=true
    }
    res.render('./userViews/searchPost',{
        isLoggedIn,
        document
    })
}

module.exports.myDeals_get = async (req, res) => {
    var document=[]
    const type=req.params.type
    if(type=="false"){
        var document1= await Document.find({user:req.user._id,active:false})
        for(var i of document1){
            var cur=await i.populate('boughtBy').execPopulate()    
            document.push(cur)
            console.log(cur)
        }
        
    }else{
        document= await Document.find({user:req.user._id,active:true})
    }
   
    console.log(document)
    const token=req.cookies.jwt
    var isLoggedIn=false
    if(token){
        isLoggedIn=true
    }
    res.render('./userViews/myDeals',{
        type,
        isLoggedIn,
        document,
    })
}
module.exports.delete_get = async (req, res) => {
    const id=req.params.id
    
    await Document.findOneAndUpdate({ _id:  id}, { $set: { active:false } }, { new: true }, (err, doc) => {
        if (err) {
            res.redirect('/')
        }
    });
    res.redirect('/user/deals/false')
}
module.exports.comment_post = async (req, res) => {
    const id = req.params.id
    const com=req.body.comment
    console.log(com)
    const document = await Document.findOne({ _id: id })
    const comment=document.comment
    const newComment=new Comment({
        name:req.user.name,
        user:req.user._id,
        desc:com,
    })
    let saveComment = await newComment.save()
    comment.push(saveComment._id)
    const doc = await Document.findOneAndUpdate({ _id: id }, { $set: { comment } }, { new: true }, (err, doc) => {
        if (err) {
            res.redirect('/')
        }
    });
    res.redirect(`/user/post/${id}`)
}

module.exports. chat_get = async (req, res) => {
    const id=req.params.id
    const postId=req.params.postId
    const chat1=await Chat.find({sender:req.user._id,reciever:id,document:postId})
    const chat2=await Chat.find({sender:id,reciever:req.user._id,document:postId})
    var chat=[]
    for(var i of chat1){
        var chat3=await i.populate('sender').execPopulate()
        var _chat=await chat3.populate('reciever').execPopulate()
        var cur;
        
            cur={
                message:_chat.message,
                sender:_chat.sender.name,
                reciever:_chat.reciever.name,
                time:_chat.time,
                class:"replied"
            }
        chat.push(cur)
    }
    for(var i of chat2){
        var chat3=await i.populate('sender').execPopulate()
        var _chat=await chat3.populate('reciever').execPopulate()
        var cur;
        
            cur={
                message:_chat.message,
                sender:_chat.sender.name,
                reciever:_chat.reciever.name,
                time:_chat.time,
                class:""
            }
        chat.push(cur)
    }
    chat.sort((a,b) => (a.time > b.time) ? 1 : ((b.time > a.time) ? -1 : 0))
    // console.log(chat)
    res.render('./userViews/chat',{
        id,
        postId,
        chat
    })
}
module.exports.chat_post = async (req, res) => {
    const id=req.params.id
    const postId=req.params.postId
    const message=req.body.message
    const reciever=await User.findOne({_id:id})
    const sender=req.user
    const chat = new Chat({ message ,reciever,sender,time:Date.now(),document:postId})
    let saveChat = await chat.save()
    // console.log(saveChat)
    res.redirect(`/user/chat/${id}/${postId}`)
}
module.exports.users_get = async (req, res) => {
    const id=req.params.id
    const chat=await Chat.find({document:id})
    var senders=[]
    for(var i of chat){
        const _chat=await i.populate('sender').execPopulate()
        if(String(_chat.sender._id)!=String(req.user._id))
        senders.push({name:_chat.sender.name,senderId:_chat.sender._id,postId:id})
    }    
    const sender = senders.reduce((accumulator, current) => {
        if (!accumulator.find((item) => String(item.senderId) === String(current.senderId))) {
          accumulator.push(current);
        }
        return accumulator;
      }, []);
      
    console.log(sender)
    res.render('./userViews/message',{
        sender
    })
}

module.exports.barter_post = async (req, res) => {
    const postId=req.params.id
    const barterId=req.body.uniq
    const user=req.user
    const post=await Document.findOne({id:barterId,user:user._id,active:true})
    if(!post){
        console.log("post not available")
    }else{
        const elsePost=await Document.findOne({_id:postId})
        const deals=elsePost.deals
        deals.push(post)
        await Document.findOneAndUpdate({ _id:  postId}, { $set: { deals } }, { new: true }, (err, doc) => {
            if (err) {
                res.redirect('/')
            }
        });
    }
    

    res.redirect(`/user/post/${postId}`)
}

module.exports.accept_get = async (req, res) => {
    const id1=req.params.id1
    const id2=req.params.id2
    const post1=await Document.findOne({_id:id1})
    const post2=await Document.findOne({_id:id2})
    await Document.findOneAndUpdate({ _id:  id1}, { $set: { active:false,boughtBy:post2.user } }, { new: true }, (err, doc) => {
        if (err) {
            res.redirect('/')
        }
    });
    await Document.findOneAndUpdate({ _id:  id2}, { $set: { active:false ,boughtBy:post1.user} }, { new: true }, (err, doc) => {
        if (err) {
            res.redirect('/')
        }
    });
    res.redirect('/')
}
module.exports.user_get = async (req, res) => {
   const user=req.user

    res.render('./userViews/profile',{
        user
    })
}

module.exports.buy_get = async (req, res) => {
    const user=req.user
    const id=req.params.id
    const post=await Document.findOne({_id:id})
    if(user.score>post.score||user.score==post.score){
        const score=(user.score-post.score)
        await Document.findOneAndUpdate({ _id:  id}, { $set: { active:false ,boughtBy:user._id} }, { new: true }, (err, doc) => {
            if (err) {
                res.redirect('/')
            }
        });
        await User.findOneAndUpdate({ _id:  user._id}, { $set: { score} }, { new: true }, (err, doc) => {
            if (err) {
                res.redirect('/')
            }
        });
    }
    res.redirect('/user/profile')
 }


 module.exports.credits_post = async (req, res) => {
    const id = req.params.id
    const _credits=req.body.credits
    const document = await Document.findOne({ _id: id })
    const credits=document.credits
    const newCredits=new Credits({
        name:req.user.name,
        user:req.user._id,
        amount:_credits,
    })
    let saveCredits = await newCredits.save()
    credits.push(saveCredits._id)
    const doc = await Document.findOneAndUpdate({ _id: id }, { $set: { credits } }, { new: true }, (err, doc) => {
        if (err) {
            res.redirect('/')
        }
    });
    console.log(doc)
    res.redirect(`/user/post/${id}`)
}
module.exports.perhour_post = async (req, res) => {
    const id = req.params.id
    const hrs=req.body.hrs
    const document = await Document.findOne({ _id: id })
    const user=await User.findOne({_id:document.user})
    const perhour=document.perhour
    const total=perhour*hrs
    const newPerhour=new Perhour({
        name:req.user.name,
        user:req.user._id,
        amount:total,
    })
    let savePerhour = await newPerhour.save()
    await User.findOneAndUpdate({ _id: req.user._id}, { $set: { score: req.user.score - total } }, { new: true }, (err, doc) => {
        if (err) {
            res.redirect('/')
        }
    });
    await User.findOneAndUpdate({ _id: user._id }, { $set: { score: user.score  + total} }, { new: true }, (err, doc) => {
        if (err) {
            res.redirect('/')
        }
    });
    console.log(doc)
    res.redirect(`/user/post/${id}`)
}


module.exports.acceptCredits_get = async (req, res) => {
    const postId=req.params.id
    //id of the requested user
    const requestedUserId=req.params.id1
    //requested user need to send this amount
    const requestedAmountString=req.params.id2
    const requestedAmount=parseInt(requestedAmountString)
    const requestedUser=await User.findOne({ _id : requestedUserId })
    if(requestedUser.score>requestedAmount||requestedUser.score==requestedAmount){
        const user=await User.findOne({ _id : req.user._id })
        const currentScoreOfSeller=user.score+requestedAmount
        const currentScoreOfBuyer=requestedUser.score-requestedAmount
        await User.findOneAndUpdate({ _id: requestedUserId }, { $set: { score: currentScoreOfBuyer} }, { new: true }, (err, doc) => {
            if (err) {
                res.redirect('/')
            }
        });
        await User.findOneAndUpdate({ _id: req.user._id }, { $set: { score: currentScoreOfSeller} }, { new: true }, (err, doc) => {
            if (err) {
                res.redirect('/')
            }
        });
        await Document.findOneAndUpdate({ _id:  postId}, { $set: { active:false,boughtBy:requestedUserId } }, { new: true }, (err, doc) => {
            if (err) {
                res.redirect('/')
            }
        });
    }
    
    res.redirect('/')
}


