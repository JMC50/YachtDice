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

interface room {
    name: string;
    people: number;
    turn: "player1" | "player2"
    game: {
        user1: game;
        user2: game;
    }
}

const app = express();
const PORT = 7007;

app.use(express.json());
app.use(express.raw({"limit" : "10mb"}));
app.use('/client', express.static(path.resolve(__dirname, '..', '..', 'client')));

app.get("/", async (req, res) => {
    res.redirect("/client/main.html");
})

app.get("/mainpage", async (req, res) => {
    const seat = req.query.seat;
    res.redirect(`/client/mainpage.html?seat=${seat}`);
})

app.get("/admin", async (req, res) => {
    res.redirect("/client/admin.html");
})

app.get("/game", async (req, res) => {
    const roomId = req.query.room;
    const seat = req.query.seat;
    const player = req.query.player;
    res.redirect(`/client/index.html?room=${roomId}&seat=${seat}&player=${player}`);
})

app.get("/getimg", async (req, res) => {
    const name = req.query.name as string;
    const img = await fs.readFile(path.resolve(__dirname, "..", "data", `${name}.png`));
    res.end(img);
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

app.get("/getroompeople", async (req, res) => {
    const roomId = <string>req.query.id;
    const file = await fs.readFile(path.resolve(__dirname, "..", "room", `${roomId}.json`));
    const temp_data = await file.toString();
    const data = JSON.parse(temp_data) as room;
    res.json({people: data.people});
    
    data.people++;
    await fs.writeFile(path.resolve(__dirname, "..", "room", `${roomId}.json`), JSON.stringify(data))
})

app.get("/getturn", async (req, res) => {
    const roomId = <string>req.query.id;
    const file = await fs.readFile(path.resolve(__dirname, "..", "room", `${roomId}.json`));
    const temp_data = await file.toString();
    const data = JSON.parse(temp_data) as room;
    res.json({turn: data.turn})
})

app.get("/changeturn", async (req, res) => {
    const roomId = <string>req.query.id;
    const file = await fs.readFile(path.resolve(__dirname, "..", "room", `${roomId}.json`));
    const temp_data = await file.toString();
    const data = JSON.parse(temp_data) as room;

    if(data.turn == "player1"){
        data.turn = "player2";
        await fs.writeFile(path.resolve(__dirname, "..", "room", `${roomId}.json`), JSON.stringify(data))
    }else{
        data.turn = "player1";
        await fs.writeFile(path.resolve(__dirname, "..", "room", `${roomId}.json`), JSON.stringify(data))
    }

    res.end("good");
})

app.get("/resetgame", async (req, res) => {
    const roomId = <string>req.query.id;
    const file = await fs.readFile(path.resolve(__dirname, "..", "room", `${roomId}.json`));
    const temp_data = await file.toString();
    const data = JSON.parse(temp_data) as room;

    if(data.turn == "player1"){
        data.turn = "player2";
        data.people = 0;
        await fs.writeFile(path.resolve(__dirname, "..", "room", `${roomId}.json`), JSON.stringify(data))
    }else{
        data.turn = "player1";
        data.people = 0;
        await fs.writeFile(path.resolve(__dirname, "..", "room", `${roomId}.json`), JSON.stringify(data))
    }

    res.end("good");
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
    console.log(`server is now running at http://localhost:${PORT} or http://192.168.0.23:${PORT} or http://1.242.225.56:${PORT}`);
})

const io = new Server(server);
io.on("connection", (socket) => {
    socket.emit("room");

    socket.on("change", (roomId:string, map:Map<string, string>) => {
        socket.broadcast.emit("enemy_change", roomId, map);
    })

    socket.on("change_dice", (dices:any, roomId:string) => {
        console.log("ㅇㅅㅇ", dices)
        socket.broadcast.emit("enemy_change_dice", dices, roomId)
    })

    socket.on("disconnecting", () => {
        console.log("누군가 게임을 나감")
    })
});