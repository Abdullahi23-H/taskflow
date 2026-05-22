import {Router}   from "express";
import bcrypt from "bcryptjs";
import {z} from "zod";
import {prisma} from "../../lib/prisma.js";
export const authRouter = Router();
const registerSchema = z.object({
    email: z.string().email(),
    name: z.string().min(3),
    password: z.string().min(8).max(128)
});
authRouter.post("/register",async(req,res)=>{
    try{
        const body  = registerSchema.parse(req.body);
        const existing = await prisma.user.findUnique({
            where: {
                email: body.email
            }
        });
        if(existing){
            return res.status(409).json({error: "User already registered"});
        }
        const passwordHash = await bcrypt.hash(body.password, 10);
        const user  = await prisma.user.create({
            data:{
                email: body.email,
                name: body.name,
                password: passwordHash
            },
            select:{
                id: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true
            }
        });
        return res.status(201).json({user});
        

        }catch(err){
            if(err instanceof z.ZodError){
                return res.status(400).json({ error: "Invalid input", details: err.flatten() });
            }
            console.error(err);
            return res.status(500).json({ error: "Internal server error" });
            }
        });
    



