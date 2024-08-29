const express = require('express');
const {singlepost, updatepost, deletepost, createPostCtrl, fetchpostctrl, toggleLikePost, toggleDislikePost, postDetailsCtrl } = require('../controller/PostCtrl');
const PostRouter = express.Router()
const isLogin = require("../middleware/isLogin")
const multer = require("multer")
const storage = require ("../config/cloudinary")
//instance of multer
const upload = multer({storage})


//All Post
PostRouter.get("/",isLogin, fetchpostctrl);


//single Post
PostRouter.get("/profile/:id", singlepost);


//update Post
PostRouter.put("/update/:id",isLogin,upload.single("photo"), updatepost);

//delete Post
PostRouter.delete("/profile/:id",isLogin, deletepost);


PostRouter.post("/",isLogin, createPostCtrl)

//togglelike
PostRouter.get("/like/:id", isLogin, toggleLikePost)

//toggledislike
PostRouter.get("/dislike/:id", isLogin, toggleDislikePost)

//postDetailsCtrl
PostRouter.get("/views/:id", isLogin, postDetailsCtrl)

    module.exports = PostRouter