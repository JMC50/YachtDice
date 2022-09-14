import express from "express";
import fs from "fs/promises";
import { Socket, Server } from "socket.io"
import path from "path";

interface game {
    score: number[];
    dice: number[];
    keep: number[];
    dice_turn: number;
    turn: number;
}

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.raw({"limit" : "10mb"}));
app.use('/client', express.static(path.resolve(__dirname, '..', '..', 'client')));

app.get("/", async (req, res) => {
    res.redirect("/client/main.html");
})

app.get("/admin", async (req, res) => {
    res.redirect("/client/admin.html");
})

app.get("/game", async (req, res) => {
    res.redirect("/client/index.html");
})

app.get("/getimg", async (req, res) => {
    const name = req.query.name as string;
    const img = await fs.readFile(path.resolve(__dirname, "..", "data", `${name}.png`));
    res.end(img);
})

app.get("/mkroom", async (req, res) => {
    const name = req.query.name as string;
    const json = {
        name: name,
        people: 0,
        game: {
            user1: {
                
            },
            user2: {
                
            }
        }
    }
    await fs.writeFile(path.resolve(__dirname, "..", "room", `${name}.json`), JSON.stringify(json));
    io.emit("room");
    res.json(true);
})

app.get("/rmroom", async (req, res) => {
    const name = req.query.name;
    await fs.rm(path.resolve(__dirname, "..", "room", `${name}.json`));
    res.json(true);
})

app.get("/getrooms", async (req, res) => {
    const rooms = await fs.readdir(path.resolve(__dirname, "..", "room"));
    const arr = [];
    for(let i of rooms){
        const file = await fs.readFile(path.resolve(__dirname, "..", "room", i));
        const data = await file.toString();
        arr.push(JSON.parse(data));
    }
    res.json(arr);
    
})

app.get("/login", async (req, res) => {
    const pw = req.query.pw as string;
    if(pw == "sivascript"){
        res.json(true);
    }else{
        res.json(false);
    }
})

const server = app.listen(PORT, () => {
    console.log(`server is now running at http://localhost:${PORT} or http://192.168.0.23:${PORT}`);
})

const io = new Server(server);
io.on("connection", (socket) => {
    socket.emit("room");
});