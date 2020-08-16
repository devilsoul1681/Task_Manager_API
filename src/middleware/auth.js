const User =require("../models/user");
const jwt=require("jsonwebtoken");

const auth=async (rq,rs,next)=>{
    try {
        const token = rq.cookies['auth_token']
        const decode=jwt.verify(token,process.env.SECRET_FOR_PASSWORD);
        const user=await User.findOne({_id:decode._id,'tokens.token':token})
        if(!user){
            throw new Error()
        }
        rq.user=user;
        rq.token=token;
        next();
    } catch (e) {
        rs.status(401).send("Please authanticate!!")
    }


}

module.exports=auth;