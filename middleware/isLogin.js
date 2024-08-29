// const verifyToken = require("../utilities/verifyToken");
const getTokenFromheader = require("../utils/getTokenFromHeader");
const verifyToken = require("../utils/verifyToken");

const isLogin = (req, res, next) => {
  // GET TOKEN FROM  HEADERS
  const token = getTokenFromheader(req);

  // VERIFY TOKEN
  const decodedUser = verifyToken(token)

  // SAVE THE USER INTO REQ OBJ
  req.userAuth = decodedUser.id;
  if (!decodedUser) {
    return res.json({
      msg: "Invalid/Expired token, please login again",
    });
  } else {
    next();
  }
};

module.exports = isLogin;