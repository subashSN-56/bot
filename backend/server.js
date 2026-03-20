import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import chatRoutes from "./routes/chat.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅    MongoDB Connected "))
  .catch(err => console.log(err));


// routes
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
    res.send("Welcome to the AI Chatbot API!");
});

// server start
app.listen(5000, () => {
    console.log("🚀    Server running on http://localhost:5000");
});