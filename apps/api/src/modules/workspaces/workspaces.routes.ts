import {Router} from "express";
import {z} from "zod";
import {prisma} from "../../lib/prisma.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
export const workspacesRouter = Router();
const createWorkspaceSchema =z.object({
    name: z.string().min(1).max(100),
})
workspacesRouter.use(authMiddleware);
workspacesRouter.post('/',async(req,res)=>{
    try{
        const body  = createWorkspaceSchema.parse(req.body);
        const workspace = await prisma.workspace.create({
            data:{
                name:body.name,
                ownerId:req.userId!,
            },
            select:{
                id:true,
                name:true,
                ownerId:true,
                createdAt:true,
                updatedAt:true,
            }
        })
        return res.status(201).json({workspace});
    }catch(err){
        if(err instanceof z.ZodError){
            return res.status(400).json({error: "Invalid input", details: err.flatten()});
        }
        console.error(err);
        return res.status(500).json({error: "Internal server error"});
    }
})

workspacesRouter.get("/", async(req,res)=>{
    try{
        const workspaces = await prisma.workspace.findMany({
            where:{ownerId: req.userId!},
            select:{
                id:true,
                name:true,
                createdAt:true,
                updatedAt:true,
            },
            orderBy:{createdAt:"desc"}
        });
        return res.json({workspaces});
        
    }catch(err){
        console.error(err);
        return res.status(500).json({error: "Internal server error"});
    }

        
})



