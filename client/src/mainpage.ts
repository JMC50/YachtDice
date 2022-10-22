import { io, Socket } from  "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
// import { io, Socket } from "socket.io-client"

interface room {
    name: string;
    people: number;
}

const socket:Socket = io(location.origin);
const room = <HTMLDivElement>document.querySelector(".room");

room.addEventListener("click", async (e) => {
    const target = e.target as HTMLDivElement;
    const seat = location.href.split("seat=")[1];
    if(target.classList.contains("room")){
        const res = await fetch(`/getroompeople?id=${seat}`);
        const data = await res.json();
        if(data.people !== 2){
            const a = document.createElement("a");
            const url = location.href.split("?")[1];
            a.href = document.location.href.split("client")[0] + `game?${url}` + `&room=${seat}&player=player${data.people + 1}`;
            a.click();
        }
    }
})