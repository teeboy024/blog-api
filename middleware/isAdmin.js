// const verifyToken = require("../utilities/verifyToken");
const User = require("../model/User/User");
const appError = require("../utils/appError")
const getTokenFromheader = require("../utils/getTokenFromHeader");
const verifyToken = require("../utils/verifyToken");

const isAdmin = async (req, res, next) => {
  // GET TOKEN FROM  HEADERS
  const token = getTokenFromheader(req);

  // VERIFY TOKEN
  const decodedUser = verifyToken(token)

  // SAVE THE USER INTO REQ OBJ
  req.userAuth = decodedUser.id;
  const user = await User.findById(decodedUser.id);
  if (user.isAdmin ){
    return next();
  } else{
    return next(appError("Acess Denied, Admin Only", 404));
  }
};

module.exports = isAdmin;