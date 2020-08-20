const app=require("./routers/app");
const port=process.env.PORT;
// const main=async ()=>{
//     const task=await Task.findById("5eebbb39ccb2512e440114cc");
//     await task.populate('owner').execPopulate();
//     console.log(task.owner)

//     const user=await User.findById("5eebbb28ccb2512e440114ca")
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks);
// }
// main();


// const multer=require("multer");
// const upload=multer({
//     dest:'images',
//     limits:{
//         fileSize:2000000
//     },
//     fileFilter(rq,file,cb){
//        if(!file.originalname.match(/\.(doc|docx)$/)){
//            return cb(new Error("Please upload word file"));
//        }

//        cb(undefined,true);
//     }
// })

// app.post("/upload",upload.single('image'),(rq,rs)=>{
//     rs.send();
// })

app.listen(port,()=>{
    console.log("server is running on "+port);
})