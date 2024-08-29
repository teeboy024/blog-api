// const post = require("../model/Post/Post")
const Post = require("../model/Post/Post");
const User = require("../model/User/User");
// const { post } = require("../routes/post routes");
const appErr = require("../utils/appError")

//all post
const fetchpostctrl = async (req ,res ,next) =>{
    const allPost = await Post.find({})
    .populate("user")
    .populate("category","title");
    try{
     
      
        const filterPosts = allPost.filter((post) =>{
        const blockedUsers = post.user.blocked
        const isBlocked = blockedUsers.includes(req.userAuth)
        return !isBlocked
      });    
        // const filterPosts = Allpost.filter((post) => post.user.blocked.filter((id) =>  id === req.userAuth))
        res.json({
            status: "success",
            data: filterPosts
        })
    } catch (error) {
        res.json(error.message)
    }
}

//single post
const singlepost =  async (req,res)=>{
    try {
         //find the user who made a single
        const getSinglePost = await Post.findById(req.params.id);
        res.json({
            status: "success",
            data: getSinglePost,
        })
    } catch (error) {
        res.json(error.message)
    }
}

//update post
const updatepost = async (req,res ,next )=>{
 const {title,description,category} = req.body
    try {
      //find the post 
      const post = await Post.findById(req.params.id)
      if(post.user.toString() !== req.userAuth.toString()){
        return next (appErr("you are not allowed to update this post"))
      }
      const updated =  await Post.findByIdAndUpdate(
        req.params.id,
        { title, description,category ,photo:req?.file?.path},
        { new: true, }
      ); 
      await post.save()
      res.json({
        status: "success",
        data: updated,
    })
    } catch (error) {
        next(appErr(error.message))
    }
}

const deletepost =  async (req , res, next) => {
    try {
      //find the post
      const post = await Post.findById(req.params.id)
      if(!post){
        return next(appErr("post not found or post has been deleted"))
      }
      //find the user post to be deleted
      const author = await User.findById(req.userAuth)
      if(!author){
        return next (appErr("author not found"))
      }
      if(post.user._id.toString() === author._id.toString()){
        await Post.findByIdAndDelete(req.params.id)
      }else{
        return next(appErr("this is not the user that made the post"))
      }

        res.json({
            status: "success",
            data: "post deleted successfully"
        })
    } catch (error) {
        res.json(error.message)
    }
}

//create
const createPostCtrl = async (req,res,next) => {
    const {title,description,category} = req.body;
    try {
        //find the user
        const author = await User.findById(req.userAuth)
        //check if user is blocked
        if(author.isBlocked){
            return next (appErr("acesss denied,account Blocked"))
        }
        //check if the title exists
        const postTitle = await Post.findOne({title});
        if(postTitle){
          return next (appErr(`${title} already exist`,403))
        }
        //create the post
        const postCreated = await Post.create({
            title,
            description,
            category,
            user: author._id,
          
        });
        //Associate user to a post -push the post into posts
        author.post.push(postCreated);
        await author.save();
        res.json({
            status:"success",
            data: postCreated,
        });
    } catch (error) {
        res.json(error.message);
    }
}

//togglelike
const toggleLikePost = async (req, res, next) => {
    try {
      // GET THE POST
      const posts = await Post.findById(req.params.id);
  
      // CHECK IF THE USER HAS ALREADY LIKED THE POST
      const isliked = posts.likes.includes(req.userAuth);
  
      // CHECK IF THE USER HAS ALREADY DISLIKED THE POST
      const isdisliked = posts.dislikes.includes(req.userAuth);
  
      if (isdisliked) {
        return next(
          appErr(
            "You have already disliked this post, undislike to continue",
            403
          )
        );
      } else {
        // UNLIKE THE POST IF THE USER HAS ALREADY LIKED THE POST BEFORE
        if (isliked) {
          posts.likes = posts.likes.filter(
            (like) => like.toString() !== req.userAuth.toString()
          );
          await posts.save();
        } else {
          posts.likes.push(req.userAuth);
          await posts.save();
        }
        res.json({
          status: "success",
          data: posts,
        });
      }
    } catch (error) {
      res.json(error.message);
    }
  };

  //toggleDislikePost
  const toggleDislikePost = async (req, res, next) => {
    try {
      // GET THE POST
      const posts = await Post.findById(req.params.id);
  
      // CHECK IF THE USER HAS ALREADY LIKED THE POST
      const isliked = posts.likes.includes(req.userAuth);
  
      // CHECK IF THE USER HAS ALREADY DISLIKED THE POST
      const isdisliked = posts.dislikes.includes(req.userAuth);
  
      if (isliked) {
        return next(
          appErr(
            "You have already liked this post, unlike to continue",
            403
          )
        );
      } else {
        // UNLIKE THE POST IF THE USER HAS ALREADY LIKED THE POST BEFORE
        if (isdisliked) {
          posts.dislikes = posts.dislikes.filter(
            (dislike) => dislike.toString() !== req.userAuth.toString()
          );
          await posts.save();
        } else {
          posts.dislikes.push(req.userAuth);
          await posts.save();
        }
        res.json({
          status: "success",
          data: posts
        });
      }
    } catch (error) {
      res.json(error.message);
    }
  };

  const postDetailsCtrl = async (req, res, next) => {
    try {
      // FIND THE POST
      const posts = await Post.findById(req.params.id);
  
      // NUMBER OF VIEWS
      // CHECK IF THE USER VIEWED THE POST
      const isViewed =  posts.numViews.includes(req.userAuth);
  
      if (isViewed) {
        res.json({
          status: "success",
          data: posts,
        });
      } else {
        // PUSH INTO numViews
        posts.numViews.push(req.userAuth);
        await posts.save();
        res.json({
          status: "success",
          data: posts,
        });
      }
    } catch (error) {
      next(appErr(error.message));
    }
  };
module.exports = {
    fetchpostctrl,
    createPostCtrl,
    singlepost,
    updatepost,
    deletepost,
    toggleLikePost,
    toggleDislikePost,
    postDetailsCtrl
}