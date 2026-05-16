import express from "express";
const app = express();
const port = 3001;
app.get("/health",(_req,res)=>{
    res.json({status: "ok", service: "taskflow-api"});
});
app.listen(port, ()=>{
    console.log(`TaskfFlow API running at http://localhost:${port}`);
});