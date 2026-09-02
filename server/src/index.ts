import express from 'express';
import cors from 'cors';
import { router } from './routes/route.js';
import connectDB from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res)=>{
    res.status(200).json({
        message: "Hello World"
    });
});

app.use("/api/v1", router);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();