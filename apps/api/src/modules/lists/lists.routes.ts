import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
export const listsRouter = Router({ mergeParams: true});
const createListSchema = z.object({
    name: z.string().min(1).max(100),
  });
  listsRouter.use(authMiddleware);

  listsRouter.post("/", async(req,res)=>{
    try{
        const workspaceId = (req.params as any).workspaceId as string;
        const boardId = (req.params as any).boardId as string;
        const body = createListSchema.parse(req.body);
        const board  = await prisma.board.findFirst({
            where:{
                id : boardId, 
                workspaceId: workspaceId,
                workspace: {ownerId: req.userId!},
            }
        });
        if(!board){
            return  res.status(404).json({ error: "Board not found" });
        }
const position = await prisma.list.count({
    where:{
        boardId: board.id,
    }
});
const  list = await prisma.list.create({
    data:{
        name:body.name,
        boardId:board.id,
        position,
    },
    select:{
        id: true,
        name: true,
        position: true,
        boardId: true,
        createdAt: true,
        updatedAt: true,
    }
});
return res.status(201).json({list});
        

        }catch(err){
            if(err instanceof z.ZodError){
                return res.status(400).json({error: "Invalid input", details: err.flatten()});
            }
            console.error(err);
            return res.status(500).json({error: "Internal server error"});
        };
    });
    
    listsRouter.get("/",async(req, res)=>{
        try{
            const workspaceId=  (req.params as any).workspaceId as string;
            const boardId = (req.params as any).boardId as string;
            const board = await prisma.board.findFirst({
                where:{
                    id: boardId,
                    workspaceId: workspaceId, 
                    workspace: {ownerId: req.userId!},
                }
            });
            if(!board){
                return res.status(404).json({ error: "Board not found" });
            }
            const lists = await prisma.list.findMany({
                where:{
                    boardId: board.id,
                },
                select:{
                    id: true,
                    name: true,
                    position: true,
                    boardId: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy:{
                    position: "asc",
                },
            });
            return res.status(200).json({lists});
             
                 
        }catch(err){
            if(err instanceof z.ZodError){
                return res.status(400).json({error: "Invalid input", details: err.flatten()});
            }
            console.error(err);
            return res.status(500).json({error: "Internal server error"});
        };
        
    })
  
  