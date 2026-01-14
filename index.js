import express from "express"
import dotenv from "dotenv"
import connectDB from "./src/database/connectDB.js"
import cookieParser from "cookie-parser"
import authRoute from "./src/routes/auth.route.js"
import chatRoute from "./src/routes/chat.route.js"
import personalityRoute from "./src/routes/personality.route.js"
import memoryRoute from "./src/routes/memory.route.js"

dotenv.config()

connectDB()
    .then(() => {
        console.log("Database connected...")
    })
    .catch((error) => {
        console.log(error)
    })

const app = express()

const port = process.env.PORT 

app.use(express.json())
app.use(cookieParser())

app.use("/api/v1/auth", authRoute)
app.use("/api/v1/chat", chatRoute)
app.use("/api/v1/personality", personalityRoute)
app.use("/api/v1/memory", memoryRoute)

app.get("/", (req, res) => {
    res.send("Backend running successfully...")
})

app.listen(port, () => {
    console.log(`Ai Chatbot listening on port http://localhost:${port}`)
})