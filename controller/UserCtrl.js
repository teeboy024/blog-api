const User = require("../model/User/User");
// const Posts = require("../model/Post/Post")
const Category = require("../model/Category/Category")
const Comment  = require("../model/Comment/Comment")
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/genereteToken");
const appErr = require("../utils/appError");
const Post = require("../model/Post/Post");
// const { post } = require("../routes/user routes");


//Register
const register = async (req , res, next) =>{
    
  const { firstName, lastName, profilePhoto, email, password , isAdmin } = req.body;

  try {
    //check if email is exist
    const userFound = await User.findOne({ email });
    if (userFound) {
      return next(appErr ("user already exist"));
    }
    //hash password
    const salt = await bcrypt.genSalt(10)
    const hashedpassword = await bcrypt.hash(password,salt)

    //create the user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password:hashedpassword,
      isAdmin
    }); 
    res.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(appErr(error.message))
  }
        
}

//Login
const login = async (req, res, next) =>{
    const{email,password} = req.body;
    try{
         //check if email exist
         const userFound = await User.findOne({email});
         if(!userFound){
            return next(appErr("invalid credentials", 400));
         }
         //check for valid password
         const isPasswordMatch = await bcrypt.compare(
            password,
            userFound.password
         )
         if(!isPasswordMatch){
            return next(appErr("invalid credentials", 400));
         }
         //verify password

        res.json({
            status: "success",
            data: {
                id: userFound._id,
                firstName: userFound.firstName,
                email: userFound.email,
                isAdmin: userFound.isAdmin,
                token: generateToken(userFound._id)
            }
        })
    } catch (error) {
       next(appErr(error.message));
    }
}

//All Users
const allUsers = async (req, res, next) =>{
    const users = await User.find();
    try{
        res.json({
            status: "success",
            data: users,
        })
    } catch (error) {
        next(appErr(error.message));
    }
};

//single User
const singleUser =  async (req,res)=>{
    const user = await User.findById(req.userAuth);
    try {
        res.json({
            status: "success",
            data: user,
        })
    } catch (error) {
        next(appErr(error.message));
    }
}

//update user
const updateUserCtrl = async (req, res, next)=>{
    const {email, firstName,lastName} = req.body;
    try {
        //check if email
        if(email){
            const emailFound = await User.findOne({email: email})
            if(emailFound){
                return next (appErr("Email is taken", 400));
            }
        }
        //update the user
        const user = await User.findByIdAndUpdate(
            req.userAuth,
            {lastName, firstName, email},
            {new: true, runValidators: true}
        )
        res.json({
            status: "success",
            data: user
        });
    } catch (error) {
        res.json(error.message)
    }
}

//update password
const updatepasswordCrtl = async (req,res,next) =>{
    const { password } = req.body;
    try {
      //check if user is updating password
      if (password){
        const salt = await bcrypt.genSalt(10);
        const hashedpassword = await bcrypt.hash(password, salt);
       //update user
       await User.findByIdAndUpdate(
         req.userAuth,
         {
            password:hashedpassword,
         },
         {
            new: true,
            runValidators: true,
         }
    );
    res.json({
        status:"success",
        data:"password updated succesfully"
    });
   }else{
    return next(appErr("please provide password field"))
   }
    } catch (error) {
        res.json(error.message)
    }
};


const profilePhotoUploadCrtl = async (req, res , next) => {
  try {
        //1. find the user to be update
        const userToUpdate = await User.findById(req.userAuth)
        //2 check if user found 
        if(!userToUpdate){
            return next(appErr("user not found",403));
        }
        //3 check if user is blocked
        if(userToUpdate.isBlocked){
        return next(appErr("Action is not allowed, your account is blocked", 403));
        }
        //4. check if a user is updating their photo
        if(req.file){
           await User.findByIdAndUpdate(
            req.userAuth,
            {
                $set:{
                    profilePhoto : req.file.path,
                },
            },
        ),
        {
            new:true,
        }
        };
      
        res.json({
            status :" success",
            data: "You have sucessfully updated your profile photo"
        });
        

    } catch (error) {
    next(appErr(error.mess, 500))
  }
};

//WHO VIEW USER PROFILE
const whoViewedMyProfileCtrl = async (req, res, next) => {
    try {
          //1. find the original user 
    const user = await User.findById(req.params.id);
    //2. find the user who viewed the profile
    const userWhoViewed = await User.findById(req.userAuth)
    //3. check if original and who viewed are found
    if (user && userWhoViewed) {
        //4. check if user who viewed is already in the user viewer array
        const isUserAlreadyViewed = user.viewers.find(
            (viewer) => viewer.toString() === userWhoViewed._id.toJson()
        );
        if(isUserAlreadyViewed){
            return next(appErr("You already viewed this profile"));
        } else{
            //5. push the userWhoViewed into the user's viewers array
            user.viewers.push(userWhoViewed._id);
            //6. save the user
            await user.save();
            res.json({
                status:"success",
                msg: "You have successfully viewed this profile",
                data: user.viewers,
            });
        }
    }

    } catch (error) {
        next(error.message,500);
    }
};

//followers and following
const followingCtrl = async (req, res, next) => {
    try {
        //1. find the user to follow
        const userToFollow = await User.findById(req.params.id);
        //2.find the user who is following
        const userWhoFollowed =  await User.findById(req.userAuth);

        //3.check if user and userWhoFollowed are found
        if(userToFollow && userWhoFollowed){
            //4.check if userwhofollowed is already in the folowers array
            const isUserAlreadyFollowed = userToFollow.followers.find(
                (follower) => follower.toString() === userWhoFollowed._id.toString()
            );
            if (isUserAlreadyFollowed) {
                return next(appErr("You already followed the user"));
            }else{
                //5.push userWhoFollowed in the user's followers array
                userToFollow.followers.push(userWhoFollowed._id);
                //6. push userToFollow to the userWhoFollowed following array
                userWhoFollowed.following.push(userToFollow._id);
                //7.save
                await userWhoFollowed.save();
                await userToFollow.save()

                res.json({
                    status: "success",
                    message: "You have successfully followed this user",
                    followers: userToFollow.followers,
                    following: userWhoFollowed.following,
                });
            }

        }
       
    } catch (error) {
        next(appErr(error.message))
    }
};


//unfollow
const unFollowCtrl =  async (req,res,next)=>{
    try {
          //1. find the user to unfollow
          const userToBeUnFollowed = await User.findById(req.params.id);
          //2.find the user who is unfollowed
          const userWhoUnFollowed =  await User.findById(req.userAuth);
          //3 check if user and userUnfollowed are found
          if(userToBeUnFollowed && userWhoUnFollowed){
            //4  check if user who followed is already in the user followers array
            const isUserAlreadyFollowed = userToBeUnFollowed.followers.find(
                (follower) => follower.toString() === userWhoUnFollowed._id.toString()
            );
            if (!isUserAlreadyFollowed){
                return next(appErr("You are not following the user"));
            }else{
                //5. remove userWhoUnfollowed from the users followers array
                userToBeUnFollowed.followers = userToBeUnFollowed.followers.filter(
                    (follower) => follower.toString () !== userWhoUnFollowed._id.toString()
                );

                //6.save the user
                await userToBeUnFollowed.save();

                //7 remove userToBeUnFollowwed from the usersWhoFollowed array
                userWhoUnFollowed.following = userToBeUnFollowed.following.filter(
                    (following) => following.toString() !== userWhoUnFollowed._id.toString()
                );

                //8.save the user
                await userWhoUnFollowed.save();

                res.json({
                    status: "success",
                    msg:"You have succesfully unfollowed the user",
                    usertobeunfollow : userToBeUnFollowed.followers,
                    userWhounfollowed : userWhoUnFollowed.following,
                });
            }
          }
    } catch (error) {
        next(appErr(error.message));
    }
};

//block
const blockUserCtrl =  async (req,res,next)=>{
    try {
          //1. find the user to block
          const userToBeBlocked = await User.findById(req.params.id);
          //2.find the user who is blocked
          const userWhoBlocked =  await User.findById(req.userAuth);
          //3 check if user and userblocked are found
          if(userToBeBlocked  && userWhoBlocked){
            //4  check if user who blocked is already in the user blocked array
            const isUserAlreadyBlocked = userWhoBlocked.blocked.find(
                (blocked) => blocked.toString() === userToBeBlocked._id.toString()
            );
            if (isUserAlreadyBlocked){
                return next(appErr("You already block the user"));
            }else{
                //5. remove userToBeBlocked from the users Blocked array
                userWhoBlocked.blocked.push(userToBeBlocked._id);

                //6.save
                await userWhoBlocked.save();

                res.json({
                    status: "success",
                    msg:"You have succesfully blocked the user",
                    userwhoblocked : userWhoBlocked.blocked,
                });
            }
          }
    } catch (error) {
        next(appErr(error.message));
    }
};

//unblock
const unBlockCtrl =  async (req,res,next)=>{
    try {
          //1. find the user to unblock
          const userToBeUnBlocked = await User.findById(req.params.id);
          //2.find the user who is unblocked
          const userWhoUnBlocked =  await User.findById(req.userAuth);
          //3 check if user and userUnblockeded are found
          if(userToBeUnBlocked && userWhoUnBlocked){
            //4  check if user who is blocked is already in the user blocked array
            const isUserAlreadyBlocked = userWhoUnBlocked .blocked.find(
                (blocked) => blocked.toString() === userToBeUnBlocked._id.toString()
            );
            if (!isUserAlreadyBlocked){
                return next(appErr("You have unblock the user"));
            }else{
                //5 remove userToBeUnBlocked from the usersWhoBlocked array
                userWhoUnBlocked.blocked = userWhoUnBlocked.blocked.filter(
                    (blocked) => blocked.toString() !== userToBeUnBlocked._id.toString()
                );

                //6.save 
                await userWhoUnBlocked.save();

                res.json({
                    status: "success",
                    msg:"You have succesfully unblocked the user",
                    userWhounblocked : userWhoUnBlocked.blocked,
                });
            }
          }
    } catch (error) {
        next(appErr(error.message));
    }
};


//is admin blocked
const adminBlockedUserCtrl =  async (req,res,next)=>{
    try {
        //find the user to be blocked
        const userTooBeBlocked = await User.findById(req.params.id)
        if(!userTooBeBlocked){
            return next(appErr("user not found", 400 ))
        }
        //change the isblocked to true
        userTooBeBlocked.isBlocked = true;
        await userTooBeBlocked.save();
        res.json({
            status: "success",
            data: "you have succesfully block this user"
        })
    } catch (error) {
        res.json(error.message)
    }
}


//is admin unblocked
const adminUnBlockedUserCtrl =  async (req,res,next)=>{
    try {
        //find the user to be blocked
        const userTooUnBeBlocked = await User.findById(req.params.id)
        if(!userTooUnBeBlocked){
            return next(appErr("user not found", 400 ))
        }
        //change the isblocked to true
        userTooUnBeBlocked.isBlocked = false;
        await userTooUnBeBlocked.save();
        res.json({
            status: "success",
            data: "you have succesfully Unblock this user"
        })
    } catch (error) {
        res.json(error.message)
    }
}

// DELETE USER
const deleteUserCtrl = async (req, res, next) => {
    try {
      // 1. FIND THE USER TO BE DELETED
      await User.findByIdAndDelete(req.userAuth);
  
      // 2. FIND ALL POSTS BY THE USER TO BE DELETED
      await Post.deleteMany({user: req.userAuth});
  
      // 3. DELETE ALL COMMENTS OF THE USER
      await Comment.deleteMany({user: req.userAuth});
  
      // 4. DELETE ALL CATEGORIES OF THE USER
      await Category.deleteMany({user: req.userAuth});



      res.json({
        status:"success",
        data: "Your account has been deleted",
      });
    } catch (error) {
      next(appErr(error.message));
    }
  };



module.exports = {
    login,
    allUsers,
    register,
    singleUser,
    profilePhotoUploadCrtl,
    whoViewedMyProfileCtrl,
    followingCtrl,
    unFollowCtrl,
    blockUserCtrl,
    unBlockCtrl,
    adminBlockedUserCtrl,
    adminUnBlockedUserCtrl,
    updateUserCtrl,
    updatepasswordCrtl,
    deleteUserCtrl
}

