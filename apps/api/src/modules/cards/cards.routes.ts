import {Router} from "express";
import {z} from "zod";
import {prisma} from "../../lib/prisma.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
export const  cardsRouter = Router({mergeParams: true});


const createCardSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    dueDate: z.string().datetime().optional(),
    status: z.enum(["todo", "in_progress", "done"]).optional(),
});
const moveCardSchema = z.object({
    targetListId: z.string().min(1),
    position: z.number().int().min(0),
});

const updatedCardSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    dueDate: z.string().datetime().nullable().optional(),
    status: z.enum(["todo", "in_progress", "done"]).optional(),
});
cardsRouter.use(authMiddleware);
cardsRouter.post("/",async(req, res)=>{
    try{
        const workspaceId = (req.params as any).workspaceId as string;
        const boardId  = (req.params as any).boardId as string;
        const listId = (req.params as any).listId as string;
        const body = createCardSchema.parse(req.body);
        const list = await prisma.list.findFirst({
            where:{
                id: listId,
                boardId:boardId,
                board:{
                    workspaceId: workspaceId,
                    workspace: {ownerId: req.userId!},
                }
            }
        })
        if(!list){
            return res.status(404).json({error: "List not found"});
        }
        const position = await prisma.card.count({
            where:{
                listId: list.id,
            }
        });
        const card = await prisma.card.create({
            data:{
                title:body.title,
                description: body.description,
                dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
                status: body.status ?? "todo",
                listId: list.id,
                position,
            },
            select:{
                id: true,
                title: true,
                description: true,
                dueDate: true,
                status: true,
                listId: true,
                position: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        return res.status(201).json({ card });
    }catch(err){
        if(err instanceof z.ZodError){
            return res.status(400).json({error: "Invalid input", details: err.flatten()});
        }
        console.error(err);
        return res.status(500).json({error: "Internal server error"});
    }
    
});


cardsRouter.get("/", async(req, res)=>{
    try{
        const workspaceId = (req.params as any).workspaceId as string;
        const boardId = (req.params as any).boardId as string;
        const listId = (req.params as any).listId as string;
        const list = await prisma.list.findFirst({
            where:{
                id: listId ,
                boardId: boardId,
                board:{
                    workspaceId: workspaceId,
                    workspace: {ownerId: req.userId!},
                },
            },
        });
        if(!list){
            return res.status(404).json({error: "List not found"});
        }
        const cards = await prisma.card.findMany({
            where:{
                listId: list.id,
            },
            select:{
                id: true,
                title: true,
                description: true,
                dueDate: true,
                status: true,
                listId: true,
                position: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy:{
                position: "asc",
            },
        });
        return res.json({ cards });
    }catch(err){
        if(err instanceof z.ZodError){
            return res.status(400).json({error: "Invalid input", details: err.flatten()});
        }
        console.error(err);
        return res.status(500).json({error: "Internal server error"});
    }
});


 cardsRouter.patch("/:cardId/move", async(req, res)=>{
    try{
        const workspaceId = (req.params as any).workspaceId as string;
        const boardId = (req.params as any).boardId as string;
        const listId = (req.params as any).listId as string;
        const cardId = (req.params as any).cardId as string;
        const body = moveCardSchema.parse(req.body);
        

        const card = await prisma.card.findFirst({
            where:{
                id:cardId,
                list:{
                    id:listId,
                    boardId:boardId,
                    board:{
                        workspaceId:workspaceId,
                        workspace: {ownerId: req.userId!},
                    },
                },

            },
            include:{
                list:{select:{boardId:true}}
            }
        })
        if(!card){
            return res.status(404).json({error: "Card not found"});
        }
        const targetList = await prisma.list.findFirst({
            where:{
                id:body.targetListId,
                boardId:card.list.boardId,
                board:{
                    workspaceId:workspaceId,
                    workspace: {ownerId: req.userId!},
                },
            },
        });
        if(!targetList){
            return res.status(404).json({ error: "Target list not found" });
    }
    const updatedCard = await prisma.card.update({
        where: { id: card.id },
        data: {
          listId: targetList.id,
          position: body.position,
        },
        select: {
          id: true,
          title: true,
          description: true,
          dueDate: true,
          status: true,
          position: true,
          listId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return res.json({ card: updatedCard });
}catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: err.flatten() });
    }
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
 });


 cardsRouter.patch("/:cardId",async(req,res)=>{
    try{
        const workspaceId = (req.params as any).workspaceId as string;
        const boardId = (req.params as any).boardId as string;
        const listId = ( req.params as any ).listId as string;
        const cardId = (req.params as any ).cardId as string;
        const body  = updatedCardSchema.parse(req.body);

        const existing = await prisma.card.findFirst({
            where:{
                id:cardId,
                list:{
                    id:listId,
                    boardId:boardId,
                    board:{
                        workspaceId:workspaceId,
                        workspace: {ownerId: req.userId!},
                    },
                },

            },
        });
        if(!existing){
            return res.status(404).json({ error: "Card not found" });
        }
        const card =await prisma.card.update({
            where:{id:cardId},
            data:{
            ...(body.title!==undefined && {title:body.title}),
            ...(body.description!==undefined && {description:body.description}),
            ...(body.dueDate!==undefined && {dueDate:body.dueDate ? new Date(body.dueDate) : null}),
            ...(body.status!==undefined && {status:body.status}),
            },
            select:{
                id: true,
                title: true,
                description: true,
                dueDate: true,
                status: true,
                listId: true,
                position: true,
                createdAt: true,
                updatedAt: true,
            },

        });
        return res.json({card});

    }catch(err){
        if(err instanceof z.ZodError){
            return res.status(400).json({error: "Invalid input", details: err.flatten()});
        }
        console.error(err);
        return res.status(500).json({error: "Internal server error"});
    }
 });


 cardsRouter.delete("/:cardId", async(req ,res)=>{
    try{
        const workspaceId = (req.params as any ).workspaceId as string;
        const boardId = (req.params as any ).boardId as string;
        const listId = (req.params as any ).listId as string;
        const cardId = (req.params as any ).cardId as string;

        const existing = await prisma.card.findFirst({
            where:{
                id:cardId,
                list:{
                    id: listId,
                    boardId:boardId,
                    board:{
                        workspaceId:workspaceId,
                        workspace: {ownerId: req.userId!},
                    },
                },
            },
        });
        if(!existing){
            return res.status(404).json({ error: "Card not found"});
        }
        await prisma.card.delete({
            where:{id:existing.id},

        });
        return res.status(204).send();
    }catch(err){
        if(err instanceof z.ZodError){
            return res.status(400).json({error: "Invalid input", details: err.flatten()});
        }
        console.error(err);
        return res.status(500).json({error: "Internal server error"});
    }
    
 });
