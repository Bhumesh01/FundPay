import type { Request, Response } from "express";
import {z} from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { User } from "../../models/User.js";
dotenv.config();

const signUpSchema = z.object({
    name: z.string().min(3, { message: "username must be atleast 3 characters long" }).max(10, {message: "username can't be greater than 10 letters"}),
    email: z.string().email(),
    password: z.string().min(8, { message: "Password must be atleast 8 characters long" }).max(20,  {message: "Password can't be greater than 20 letters"}).refine(val=>/[A-Z]/.test(val),{ message: "Password must contain at least one uppercase letter" }) .refine(val => /[a-z]/.test(val), { message: "Password must contain at least one lowercase letter" }).refine(val => /[^A-Za-z0-9]/.test(val), { message: "Password must contain at least one special symbol" }).refine(val => /[0-9]/.test(val), { message: "Password must contain at least one digit" })
})

export const signup = async (req: Request,res: Response)=>{
    try{
        const {success, data, error} = signUpSchema.safeParse(req.body);
        if(!success){
            const formatted = error.format();
            const nameErrors = formatted.name?._errors || [];
            const passwordErrors = formatted.password?._errors || [];
            const emailErrors = formatted.email
            return res.status(400).json({
              nameErrors,
              passwordErrors,
              emailErrors
            });
        }
        const credentials:z.infer<typeof signUpSchema> = data;
        const hash = await bcrypt.hash(credentials.password, 10);
        await User.create({
            name: credentials.name,
            email: credentials.email,
            role: "customer",
            password: hash
        })
        res.status(201).json({
            message: "Successfully signed up"
        });
    }
    catch(err: any){
        if (err?.code === 11000) {
            return res.status(409).json({ message: "User already exists" });
        }
        console.log(err)
        return res.status(500).json({ message: "Error Creating User" });
    }
}
const signinSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});
export const signin = async (req: Request,res: Response)=>{
    try{
        const {success, data, error} = signinSchema.safeParse(req.body);
        if(!success){
            const formatted = error.format();
            const emailErrors = formatted.email?._errors || [];
            const passwordErrors = formatted.password?._errors || [];

            return res.status(400).json({
              emailErrors,
              passwordErrors
            });
        }
        const credentials:z.infer<typeof signinSchema> = data;
        const user = await User.findOne({
            email: credentials.email
        })
        if(user){
            const result = await bcrypt.compare(credentials.password, user.password);
            if(result){
                if (!process.env.JWT_PASSWORD) {
                    throw new Error("JWT_PASSWORD not set in environment");
                }
                const token = jwt.sign({
                    id: user._id.toString(),
                    role: user.role
                }, process.env.JWT_PASSWORD);
                return res.status(200).json({
                    message: "Successfully signed in",
                    token,
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                });
            }
            return res.status(403).json({
                message: "wrong password"
            })
        }
        return res.status(404).json({
            message: "User not Found. Please Sign Up"
        })
    }
    catch(err: any){
        return res.status(500).json({ message: err });
    }
}