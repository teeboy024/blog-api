const getTokenFromheader = (req) => {
    //get the token fron header
    const headerobj = req.headers

    const token = headerobj["authorization"].split(" ")[1];
    if (token !==undefined){
        return token
    } else {
        return false ;
    }
};

module.exports = getTokenFromheader;