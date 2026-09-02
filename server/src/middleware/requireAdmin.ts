import type { NextFunction, Request, Response } from "express";

export const requireAdmin = ( req: Request, res: Response, next: NextFunction) => {
    if (req.role !== "admin") {
        return res.status(403).json({
            message: "Admin access required"
        });
    }

    next();
};