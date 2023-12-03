import express  from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors"
import ErrorMiddelware from "./middelware/error.js"
import userRoute from "./routes/userRoute.js"
import messageRoute from "./routes/messageRoute.js"
// import { join, resolve } from "path";

const app = express();
// const dirName = resolve();

// Config
config({
    path:"./config/config.env"
})

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json())
app.use(
    cors({
      origin: [process.env.FRONTEND_URL, "http://192.168.1.102:3000"],
      credentials: true,
      methods:["GET", "POST", "PUT", "DELETE"]
    })
);


// app.get("/", (req, res)=>{
//     res.send("Welcome")
// })

// Using Routes
app.use("/api/v1", userRoute)
app.use("/api/v1", messageRoute)

// app.use(express.static(join(dirName, "../client/build")));

// app.get("*", (req, res) => {
//   res.sendFile(join(dirName, "../client/build/index.html"));
// });


export default app

// Using Custom Error Middelware
app.use(ErrorMiddelware)