const express=require("express");
const Task = require("../models/task");
const router=new express.Router();
const auth =require("../middleware/auth");

router.get("/tasks",auth,async (rq,rs)=>{
    const match={};
    const sort={};
    if(rq.query.sortBy){
        const parts=rq.query.sortBy.split(':')
        sort[parts[0]]=parts[1]==='desc'?-1:1;
    }
    if(rq.query.completed){
        match.completed=rq.query.completed==='true'
    }

    try {
        const user=rq.user;
        await user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(rq.query.limit),
                skip:parseInt(rq.query.skip),
                sort
            }
        }).execPopulate();
        rs.send(user.tasks);
    } catch (e) {
        rs.status(500).send();
    }
})

router.get("/task/:id",auth ,async (rq,rs)=>{
   const _id=rq.params.id;

   try {
      const task= await Task.findOne({_id,owner:rq.user._id});
             if(!task){
           return rs.status(404).send()
       }
       rs.send(task)
   } catch (e) {
    rs.status(404).send();
   }
})

router.post("/task", auth,async (rq,rs)=>{
    const task=new Task({
        ...rq.body,
        owner:rq.user._id
    })

    try {
        await task.save();
        rs.send(task);
    } catch (e) {
        rs.status(400).send(e);
    }
})

router.patch("/task/:id",auth,async (rq,rs)=>{
    let allowed=['description','completed'];
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
            const task=await Task.findOne({_id:rq.params.id,owner:rq.user._id})
            for(let i=0;i<value.length;i++){
                task[value[i]]=rq.body[value[i]];
            }
            console.log(task)
            if(!task){
             return    rs.status(404).send()
            }
            await task.save();
            rs.send(task);
        } catch (e) {
            rs.status(500).send();
        }

    }
})


router.delete("/task/:id",auth,async (rq,rs)=>{
    try{
      const task=await Task.findOneAndDelete({_id:rq.params.id,owner:rq.user._id})
      if(!task){
         return rs.status(404).send()
      }
      rs.send(task)
    }
    catch(e){
           rs.status(500).send();
    }
})


module.exports=router;