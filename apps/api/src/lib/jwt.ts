import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET || JWT_SECRET.length <16){
    throw new Error("JWT_SECRET is missing in .env or is too short");
} 
export function signAccessToken(userId:string,email:string):string{
    return jwt.sign(
        { sub: userId, email},
        JWT_SECRET,
        {expiresIn: "15m"}
    );
}