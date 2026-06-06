import {Router} from "express";
import {z} from "zod";
import {prisma} from "../../lib/prisma.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { boardsRouter } from "../boards/boards.routes.js";
export const workspacesRouter = Router();
const createWorkspaceSchema =z.object({
    name: z.string().min(1).max(100),
})
workspacesRouter.use(authMiddleware);
workspacesRouter.use("/:workspaceId/boards", boardsRouter);
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

const updateWorkSpaceSchema = z.object({
    name: z.string().min(1).max(100),
})
workspacesRouter.get("/:id", async(req,res)=>{
    try{
        const  workspace = await prisma.workspace.findFirst({
            where:{
                id: req.params.id,
                ownerId: req.userId!

            },
            select:{
                id:true,
                name:true,
                ownerId:true,
                createdAt:true,
                updatedAt:true,
            }
        })
        if(!workspace){
            return res.status(404).json({ error: "Workspace not found" })
        }
        return res.json({workspace});


    }catch(err){
        console.error(err);
        return res.status(500).json({error: "Internal server error"});
    }
});

workspacesRouter.patch("/:id",async(req,res)=>{
    try{
        const  body = updateWorkSpaceSchema.parse(req.body);
        const existing = await prisma.workspace.findFirst({
            where:{
                id: req.params.id,
                ownerId: req.userId!

            }
        });
        if(!existing){
            return res.status(404).json({error: "Workspace not found"});
        }
        const workspace =  await prisma.workspace.update({
            where:{id:existing.id},
            data:{name:body.name},
            select:{
                id:true,
                name:true,
                ownerId:true,
                createdAt:true,
                updatedAt:true,
            }


        })
        return res.json({ workspace });

    }catch(err){
        if(err instanceof z.ZodError){
            return res.status(400).json({error:"Invalid input", details: err.flatten()})
    }
    console.error(err);
    return res.status(500).json({error: "Internal server error"});
    }
})


workspacesRouter.delete("/:id", async(req,res)=>{
    try{
        const existing = await prisma.workspace.findFirst({
            where:{
                id: req.params.id,
                ownerId: req.userId!
            }
        });
        if(!existing){
            return res.status(404).json({ error: "Workspace not found" }); 
        }
        await prisma.workspace.delete({
            where:{id:existing.id},

        });
        return res.status(204).send();
    }catch(err){
        console.error(err);
        return res.status(500).json({error: "Internal server error"});
    }
});