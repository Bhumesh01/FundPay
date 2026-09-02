import type{ NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();
const JWT_PASSWORD = process.env.JWT_PASSWORD!;


export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers["authorization"];

    if (!header) {
        return res.status(401).json({ message: "No authorization header provided" });
    }

    try {
        interface JwtPayload {
            id: string; 
            role: "customer" | "admin";
        }

        const decode = jwt.verify(header, JWT_PASSWORD) as JwtPayload;

        if (decode) {
            req.userId = decode.id;
            req.role = decode.role;
            next(); 
        } else {
            return res.status(401).json({ message: "Invalid token" });
        }
    } catch (error) {
        return res.status(403).json({ message: "Unauthorized" });
    }
};