import {Router}   from "express";
import bcrypt from "bcryptjs";
import {z} from "zod";
import {prisma} from "../../lib/prisma.js";
import {signAccessToken} from "../../lib/jwt.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
export const authRouter = Router();
const registerSchema = z.object({
    email: z.string().email(),
    name: z.string().min(3),
    password: z.string().min(8).max(128)
});
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(128),
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
        const token = signAccessToken(user.id, user.email);
        return res.status(201).json({ token, user });
        

        }catch(err){
            if(err instanceof z.ZodError){
                return res.status(400).json({ error: "Invalid input", details: err.flatten() });
            }
            console.error(err);
            return res.status(500).json({ error: "Internal server error" });
            }
        });
        authRouter.post("/login",async(req,res)=>{
            try{
                const body = loginSchema.parse(req.body);
                const user = await prisma.user.findUnique({
                    where:{
                        email: body.email
                    }
                });
                if(!user){
                    return res.status(401).json({error:"Invalid email or password" })
                }
                const passwordOk = await bcrypt.compare(body.password,user.password);
                if(!passwordOk){
                    return res.status(401).json({error:"Invalid email or password" })
                }
                const token = signAccessToken(user.id,user.email);
                return res.json({
                    token, 
                    user:{
                        id: user.id,
                        email: user.email,
                        name: user.name 
                    },
                })

            }catch(err){
                if(err instanceof z.ZodError){
                    return res.status(400).json({ error: "Invalid input", details: err.flatten() });

                }
                console.error(err);
                return res.status(500).json({ error: "Internal server error" });
            }
        })
        authRouter.get("/me", authMiddleware, async (req, res) => {
            try {
              const user = await prisma.user.findUnique({
                where: { id: req.userId! },
                select: {
                  id: true,
                  email: true,
                  name: true,
                  createdAt: true,
                  updatedAt: true,
                },
              });
          
              if (!user) {
                return res.status(404).json({ error: "User not found" });
              }
          
              return res.json({ user });
            } catch (err) {
              console.error(err);
              return res.status(500).json({ error: "Internal server error" });
            }   
          });  