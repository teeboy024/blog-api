const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "post title is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "post description is required"],
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
        },
        numViews: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref:"User"
            },
        ],
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref:"User"
            },
        ],
        dislikes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref:"User"
            },
        ],
        comments: [
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"comment",
            },
           ],
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            required: [true, "please author is required"],
        },
        photo:{
            type: String,
        },
    },
    {
        timestamps: true,
        toJSON: {virtuals:true},
    }
);

postSchema.pre(/^find/,function(next){
    postSchema.virtual("viewscount").get(function(){
        const post = this;
        return post.numViews.length;
    })
    next()
    postSchema.virtual("likecount").get(function(){
        const post = this;
        return post.likes.length;
    })
    next()
    postSchema.virtual("dislikecount").get(function(){
        const post = this;
        return post.dislikes.length;
    })
    next()
})

//check the most disliked post in percentage
postSchema.virtual("likePercentage").get(function(){
    const post = this;
    const total = +post.likes.length + +post.dislikes.length
    const percentage = Math.floor(( post.likes.length/total)*100);
    return `${percentage}%`;
})
// CHECK THE POST DISLIKED POSTS IN PERCENTAGE
postSchema.virtual("dislikePercentage").get(function () {
    const post = this;
    const total = +post.likes.length + +post.dislikes.length;
    const percentage = Math.floor((post.dislikes.length / total) * 100);
    return `${percentage}%`;
  });

  // IF DAY IS LESS THAN 0 RETURN TODAY, IF DAY IS 1 RETURN YESTERDAY ELSE RETRUN DAYS AGE
  postSchema.virtual("daysAgo ").get(function () {
    const post = this;
    const date = new Date(post.createdAt); 
    const daysAgo = Math.floor((Date.now() - date) / 86400000);
    return daysAgo === 0
      ? "Today"
      : daysAgo === 1
      ? "Yesterday"
      : `${daysAgo} days ago`;
  });



// compile the user model 
const Post = mongoose.model("Post",postSchema)

module.exports = Post;