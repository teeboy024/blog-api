const express = require('express');
const { allUsers, login, register, singleUser, profilePhotoUploadCrtl, whoViewedMyProfileCtrl, followingCtrl, unFollowCtrl, blockUserCtrl, unBlockCtrl, adminBlockedUserCtrl, adminUnBlockedUserCtrl, updateUserCtrl, updatepasswordCrtl, deleteUserCtrl, } = require('../controller/UserCtrl');
const isLogin = require('../middleware/isLogin');
const storage = require('../config/cloudinary');
const UserRouter = express.Router()
const multer = require("multer");
const isAdmin = require('../middleware/isAdmin');
const upload = multer({storage})

//register user
UserRouter.post("/register", register);

//login user
UserRouter.post("/login", login);

//All user
UserRouter.get("/", allUsers);

//single user
UserRouter.get("/profile/", isLogin, singleUser );

//update user
UserRouter.put("/profile/update",isLogin, updateUserCtrl );

//update password
UserRouter.put("/profile/update-password", isLogin,updatepasswordCrtl)

//delete user
UserRouter.delete("/profile/",isLogin, deleteUserCtrl);

//Get/api/v1/users/profile-viewers/:id
UserRouter.get("/profile-viewers/:id", isLogin, whoViewedMyProfileCtrl);

//Get/api/v1/users/following/:id
UserRouter.get("/following/:id", isLogin, followingCtrl);

//Get/api/v1/users/unfollowing/:id
UserRouter.get("/unfollowing/:id", isLogin, unFollowCtrl);

//Get/api/v1/users/block/:id
UserRouter.get("/block/:id", isLogin, blockUserCtrl);


//Get/api/v1/users/unblock/:id
UserRouter.get("/unblock/:id", isLogin, unBlockCtrl);

//put/api/v1/users/unblock/:id
UserRouter.put("/admin-block/:id", isLogin, isAdmin, adminBlockedUserCtrl);

//put/api/v1/users/unblock/:id
UserRouter.put("/admin-Unblock/:id", isLogin, isAdmin, adminUnBlockedUserCtrl);



//post/api/v1/user/profile-photo-upload
UserRouter.post(
    "/profile-photo-upload", 
    isLogin,
    upload.single("profile"),
    profilePhotoUploadCrtl
)

module.exports = UserRouter