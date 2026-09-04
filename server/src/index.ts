import express from "express";
import cors from "cors";
import { router } from "./routes/route.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Hello World"
    });
});

app.use("/api/v1", router);

let dbConnected = false;

const ensureDBConnection = async () => {
    if (!dbConnected) {
        await connectDB();
        dbConnected = true;
    }
};

const handler = async (req: any, res: any) => {
    try {
        await ensureDBConnection();
        return app(req, res);
    } catch (error) {
        console.error("Database connection error:", error);

        return res.status(500).json({
            message: "Database connection failed"
        });
    }
};

export default handler;