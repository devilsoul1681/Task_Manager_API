const mongoose=require('mongoose');
const validator=require('validator');
const jwt=require("jsonwebtoken");
const bcrypt=require("bcryptjs");
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        validate:function(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid Email")
            }
        }
    },
    age:{
        type:Number,
        default:0,
        validate(value){
            if(value<0){
                throw new Error("Age can't be negative");
            }
        }
    },
    password:{
        type:String,
        required:true,
        validate(value){
            if(value.length<6){
                throw new Error("Password should be greater than 6 character")
            }
            if(value.toLowerCase().includes('password')){
                throw new Error("password cannot contain 'password'");
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    image:{
        type:Buffer
    },
    file:{
        type:Buffer
    }
},{
    timestamps:true
})

userSchema.virtual('tasks',{
    ref:'task',
    localField:'_id',
    foreignField:'owner'
})


userSchema.methods.toJSON= function(){
    const userObject=this;
    const user=userObject.toObject();
    
    delete user.tokens;
    delete user.password;
    delete user.image;
    delete user.file;
    return user;
}

userSchema.methods.getAuthToken=async function(){
    const user=this;
    const token=jwt.sign({_id:user._id},process.env.SECRET_FOR_PASSWORD);
    user.tokens=user.tokens.concat({token});
    await user.save()
    return token;

}

userSchema.statics.findByVerified=async(email,password)=>{
   const user=await User.findOne({email})
   if(!user){
       throw new Error("No user found");
   }
   const isMatch= await bcrypt.compare(password,user.password);
   if(!isMatch){
       throw new Error("Incorrect password");
   }
   return user;
}

userSchema.pre('save',async function (next){
    const user=this;
    if(user.isModified('password')){
        user.password= await bcrypt.hash(user.password,8);
    }
    next();
})


const User=mongoose.model('User',userSchema);
module.exports=User;