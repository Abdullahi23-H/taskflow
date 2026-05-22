import express from "express";
import "dotenv/config";
import {authRouter} from "./modules/auth/auth.routes.js";
const app = express();
const port = 3001;
app.use(express.json());
app.get("/health",(_req,res)=>{
    res.json({status: "caadi", service: "taskflow-api"});
});
app.use("/api/auth", authRouter);
app.listen(port, ()=>{
    console.log(`TaskFlow API running at http://localhost:${port}`);
});
