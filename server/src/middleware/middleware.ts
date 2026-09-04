import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_PASSWORD = process.env.JWT_PASSWORD!;

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const header = req.headers["authorization"];

    if (!header) {
        return res.status(401).json({
            message: "No authorization header provided"
        });
    }

    try {
        interface JwtPayload {
            id: string;
            role: "customer" | "admin";
        }

        // Remove "Bearer " from the authorization header
        const token = header.startsWith("Bearer ")
            ? header.split(" ")[1]
            : header;

        if (!token) {
            return res.status(401).json({
                message: "Invalid authorization header"
            });
        }

        const decode = jwt.verify(
            token,
            JWT_PASSWORD
        ) as JwtPayload;

        req.userId = decode.id;
        req.role = decode.role;

        next();

    } catch (error) {
        console.error("JWT verification error:", error);

        return res.status(403).json({
            message: "Unauthorized"
        });
    }
};