const express = require('express');
const {createComment, getSingleComment, fetchAllCommentCtrl, deleteCommments, updateComments } = require('../controller/CommentCtrl');
const CommentRouter = express.Router()
const isLogin = require('../middleware/isLogin')

//createcomment
CommentRouter.post("/:id", isLogin, createComment)

//All comment
CommentRouter.get("/", fetchAllCommentCtrl );

//single comment
CommentRouter.get("/:id", getSingleComment);

//update comment
CommentRouter.put("/:id", isLogin, updateComments);

//delete comment
CommentRouter.delete("/:id", isLogin, deleteCommments);


    module.exports = CommentRouter