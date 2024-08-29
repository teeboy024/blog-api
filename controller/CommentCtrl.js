const Comment = require("../model/Comment/Comment");
const appErr = require("../utils/appError");
const Post = require("../model/Post/Post")
const User  = require ("../model/User/User")

// CREATE COMMENT
const createComment = async (req, res, next) => {
  const {description } = req.body;
  try {
    //find the post 
    const post = await Post.findById(req.params.id)
    //create comment
    const comment = await Comment.create({
      post: post._id,
      description,
      user:req.userAuth
    });
    //push the comment to the post
    post.comments.push(comment._id)
    //FIND THE USER
    const user = await User.findById(req.userAuth)

    //push to user list 
    user.comments.push(comment._id)

    //save the comment 
    await post.save()
    await user.save()

    res.json({
      status: "success",
      data: comment,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

// GET COMMENT
const getSingleComment = async (req, res,) => {
  try {
    const getComment = await Comment.findById(req.params.id);
    res.json({
      status: "success",
      data: getComment
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

// UPDATE COMMENT
const updateComments = async (req, res, next) => {
  const { description, post } = req.body;
  try {
    const comments = await Comment.findByIdAndUpdate(req.params.id,{ description, post },
    { new: true, runValidators: true }
    );
    res.json({
      status: "Success",
      data: comments
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

// FETCH ALL COMMENT
const fetchAllCommentCtrl = async (req, res, next) => {
  try {
    const comment = await Comment.find();
    res.json({
      status: "Success",
      data: comment,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

// DELETE COMMENT
const deleteCommments = async (req, res, next) => {
    try {
      const comment = await Comment.findById(req.params.id);
      if(!comment){
        return next(appErr("comment does not exist or it has been deleted"),403)
      }
      if(comment.user.toString() != req.userAuth.toString()){
        return next (appErr("you are not allowed to delete this comment"),403)
      }
       await Comment.findByIdAndDelete(req.params.id)
      res.json({
        status: "success",
        data: "comment deleted successfully",
      });
    }
     catch (error) {
      next(appErr(error.message));
    }
  };

module.exports = {
  createComment,
  getSingleComment,
  deleteCommments,
  updateComments,
  fetchAllCommentCtrl
};