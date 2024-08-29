const express = require("express");
const dotenv = require("dotenv");
const UserRouter = require("./routes/user routes");
const CategoryRouter = require("./routes/category routes");
const CommentRouter = require("./routes/comment Routes");
const PostRouter = require("./routes/post routes");
const globalErrHandler = require("./middleware/globalErrHandle");
require("dotenv").config();
require("./config/dbConnect");
const app = express(); 

//middleware
app.use(express.json());
const userAuth = {
  isLogin: true,
  isAdmin: false,
};
app.use((req, res, next) => {
  if (userAuth.isLogin) {
    next();
  } else {
    return res.json({
      msg: "Invalid login credentials",
    });
  }
});




//routes
app.use("/api/v1/user",UserRouter)
app.use("/api/v1/comment" ,CommentRouter)
app.use("/api/v1/category" ,CategoryRouter)
app.use("/api/v1/post", PostRouter)






//Error handlers middleware
app.use(globalErrHandler)

//404 error 
app.use("*", (req,res) => {
  res.status(404).json({
    message:`${req.originalUrl} - route not found`
  });
});
//Listen to server



const PORT = process.env.PORT || 9000;
app.listen(PORT, console.log(`Server running on port ${PORT}` ))