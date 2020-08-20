const express=require("express");
const User =require("../models/user.js");
const auth=require("../middleware/auth");
const Task=require("../models/task");
const sharp=require('sharp');
const multer=require("multer");
const router=new express.Router();

router.post('/user', async (rq,rs)=>{
    const user=new User(rq.body);
    try {
        await user.save();
        const token=await user.getAuthToken();
        rs.cookie('auth_token', token)
        rs.status(201).send({user,token});
    } catch (e) {
      rs.status(400).send(e);
    }
})

router.post("/user/login",async(rq,rs)=>{
    try {
        const user=await User.findByVerified(rq.body.email,rq.body.password)
        const token=await user.getAuthToken();
        rs.cookie('auth_token', token)
        rs.send({user,token});
    } catch (e) {
        rs.status(404).send();
    }
})

router.get('/user/me',auth ,async (rq,rs)=>{
    const user=rq.user;
    const token=rq.token
     rs.send({user,token});
})

router.post('/logout',auth,async (rq,rs)=>{
    try {
        rq.user.tokens=rq.user.tokens.filter((token)=>{ 
        return token.token!==rq.token});
        await rq.user.save()
        rs.send("Logout Successfull");
    } catch (e) {
        rs.status(503).send()
    }
})

router.post("/logoutall",auth,async(rq,rs)=>{
    try {
        rq.user.tokens=[];
        await rq.user.save()
        rs.send("Logout of all device Successfully")
    } catch (e) {
        rs.status(503).send()
    }

})

router.get('/',(rq,rs)=>{
    rs.status(200).send('aman')
})


// router.get('/user/:id', async (rq,rs)=>{
//   const _id=rq.params.id;

//   try {
//       const user=await User.findById(_id)
//       if(!user){
//           return  rs.status(404).send();
//       }
//       rs.send(user);
//   } catch (e) {
//       rs.status(500).send()
//   }
// })

router.patch("/user/me",auth,async (rq,rs)=>{
    let allowed=['name','email',"password",'age'];
    let value=Object.keys(rq.body);
    let y=0;
    for(let i=0;i<value.length;i++){
   for(let j=0;j<allowed.length;j++){
       if(value[i]===allowed[j]){
           y=1;
           break;
       }
   }
    }
    if(y==0){
        return rs.status(404).send({error:"invalid updates"})
    }
    else{
        try {
            const user=rq.user
            for(let i=0;i<value.length;i++){
                user[value[i]]=rq.body[value[i]];
            }
            await user.save()
            rs.send(user);
        } catch (e) {
            rs.status(500).send();
        }

    }
})

router.delete("/user/me",auth,async (rq,rs)=>{
    try{
      await Task.deleteMany({owner:rq.user._id})
      const user=await User.findByIdAndDelete(rq.user._id)
      rs.send(rq.user)
    }
    catch(e){
           rs.status(500).send();
    }
})

const upload=multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(rq,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error("Please upload a valid file"))
        }

        cb(undefined,true)
    }

})

const upload2=multer({
    limits:{
        fileSize:2000000
    },
    fileFilter(rq,file,cb){
        if(!file.originalname.match(/\.(pdf|doc|docx)$/)){
            return cb(new Error("Please upload valid file"))
        }

        cb(undefined,true);
    }
})


router.post("/user/me/file",auth,upload2.single('file'),async (rq,rs)=>{
     const buffer=rq.file.buffer;
     rq.user.file=buffer;
     await rq.user.save();
     return rs.status(200).send("file has been uploaded")
},(error,rq,rs,next)=>{
    rs.send(400).send({error:error.message})
})


router.post("/user/me/avatar",auth,upload.single('avatar'),async (rq,rs)=>{
    const buffer=await sharp(rq.file.buffer).resize({width:250,height:250}).png().toBuffer()
    if(rq.user.image===undefined){
       rq.user.image=buffer
       await rq.user.save()
        return rs.status(200).send('Image is uploaded')
    }
    rq.user.image=buffer
       await rq.user.save()
       return rs.status(200).send('Image is changed to new one')
},(error,rq,rs,next)=>{
    rs.status(400).send({error:error.message})
})

router.delete("/user/me/avatar",auth,async (rq,rs)=>{
    if(rq.user.image===undefined){
        return rs.status(400).send("No image of you on the server");
    }
  rq.user.image=undefined;
  await rq.user.save();
  rs.status(200).send("image is deleted");

})

router.get("/user/:id/avatar",async (rq,rs)=>{
    try {
        const user=await User.findById({_id:rq.params.id})

        if(!user || !user.image){
            throw new Error()
        }

        rs.set('Content-Type','image/jpg');
        rs.send(user.image)
        
    } catch (e) {
        rs.status(404).send()   
    }
})


router.get("/user/:id/file",async (rq,rs)=>{
    try {
        const user=await User.findById({_id:rq.params.id})

        if(!user || !user.file){
            throw new Error()
        }

        rs.set('Content-Type', 'application/pdf');
        rs.send(user.file)
        
    } catch (e) {
        rs.status(404).send()   
    }
})



module.exports=router;