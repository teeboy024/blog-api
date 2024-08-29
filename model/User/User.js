const mongoose = require("mongoose");
const Post = require("../Post/Post");
const userSchema = new mongoose.Schema(
    {
        firstName : {
            type : String,
            require : [true,"First Name is required" ]
        },
        lastName: {
            type : String,
            require : [true,"Last Name is required" ]
            
        },
        profilePhoto: {
            type : String,
                       
        },
        email: {
            type : String,
            require : [true,"Email is required" ]
                       
        },
        password: {
            type : String,
            required : [true,"password is required" ]
        },
        isBlocked: {
        type : Boolean,
        default: false,
       },
        isAdmin: {
        type: Boolean,  
        default: false,
       },
       role: {
        type: String,
        enum: ["Admin","Guest","Editor"]
       },
       viewers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
       ],
       followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
       ],
       following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
       ],
       post: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Post",
        },
       ],
       comments: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"comment",
        },
       ],
       blocked:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
       ],
    //    plan:[
    //     {
    //         type: String,
    //         enum: ["free","premuim","pro"],
    //         default: "free",
    //     },
    //    ],
       userAward:{
        type: String,
        enum: ["Bronze","Silver","Gold"],
        default: "Bronze",
       }
    },

    {
        timestamps:true,
        toJSON :{virtuals: true},
    }
);

//Get fullname
userSchema.virtual("fullname").get(function(){
  return `${this.firstName} ${this.lastName}`
});
//Get initials 
userSchema.virtual("initials").get(function(){
    return `${this.firstName[1]}`
})

//postCount
userSchema.virtual("postCount").get(function(){
    return this.post.length
})

//follower count
userSchema.virtual("followersCount").get(function(){
    return this.followers.length
})

//following count
userSchema.virtual("followingCount").get(function(){
    return this.following.length
}) 

//viewerscount
userSchema.virtual("viweersCount").get(function(){
    return this.viewers.length
})

//blocked count
userSchema.virtual("blockedCount").get(function(){
    return this.blocked.length
}) 

userSchema.pre("findOne", async function (next) {
    //get the user id
    const userId = this._conditions._id;
    //find the post created by the user
    const posts = await Post.find({user:userId});
    //get the last post created by the user
    const lastPost = posts[posts.length -1] 

    //get the last post date
    const lastPostDate = new Date(lastPost?.createdAt);
    //get the lastpostdate into a string format
    const lastPostDatestr = lastPostDate.toDateString();
    //add virtual to the schema 
    userSchema.virtual("lastPostDate").get(function(){
        return lastPostDatestr
    }) 
    // CHECK IF USER IS INACTIVE FOR 30 DAYS
  // GET CURRENT DATE
  const currentDate = new Date();

  // GET THE DIFFERENCE BETWEEN LAST POST AND RETURN LESS THAN IN DAYS
  const diff = currentDate - lastPostDate;

  // GET THE DIFFERENCE BETWEEN IN DAYS AND RETURN LESS THAN IN DAYS
 const diffInDays = diff / (1000 * 3600 * 24);

 if(diffInDays > 30){
  // ADD VIRTUAL isInActive to the schema to check if a user is inActive for 30days
  userSchema.virtual("isInactive").get(function(){
    return true;
  });

  // FIND THE USER BY ID AND UPDATE
  await User.findByIdAndUpdate(
    userId,
    {
      isBlocked: true,
    },
    {
      new: true,
    }
  );
 } else{
  userSchema.virtual("isInactive").get(function (){
    return false;
  });
  // FIND THE USER BY ID AND UPDATE
  await User.findByIdAndUpdate(
    userId,
    {
      isBlocked: false,
    },
    {
      new: true,
      
    }
  );
 }
// -------- LAST ACTIVE DATE ------
  // CONVERT TO DAYS AGO, FOR EXAMPLE 1 DAY AGO
  const daysAgo = Math.floor(diffInDays);
  // ADD VIRTUALS LAST ACTIVE IN DAYS TO THE SCHEMA
  userSchema.virtual("lastActive").get(function (){
    // CHECK IF dayAgo IS LESS THAN 0
    if(daysAgo <= 0){
      return "Today";
    }
    // CHECK IF daysAgo is equal to 1
    if(daysAgo === 1){
      return " Yesterday";
    }
    // CHECK IF daysAgo is greater than 1
    if (daysAgo > 1){
      return `${daysAgo} days ago`
    }
  })
   //--------------------------------
    //-------------Update the award based  on post
    //get the number of posts
    const numberOfPost = posts.length;
    //check if The Number Of Post Is Less Than 10
    if (numberOfPost < 10 ){
        await User.findByIdAndUpdate(
            userId,
            {
                userAward: "Bronze",
            },
            {
                new: true,
            }
        );
    }
     //check if The Number Of Post Is greater Than 10
     if (numberOfPost > 10 ){
        await User.findByIdAndUpdate(
            userId,
            {
                userAward: "Silver",
            },
            {
                new: true,
            }
        );
    }
     //check if The Number Of Post Is greater Than 20
     if (numberOfPost > 20){
        await User.findByIdAndUpdate(
            userId,
            {
                userAward: "Gold",
            },
            {
                new: true,
            }
        );
    }
  next()
})



// compile the user model
const User = mongoose.model("User",userSchema);


module.exports = User;  