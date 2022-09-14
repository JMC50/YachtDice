import { io, Socket } from  "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
// import { io, Socket } from "socket.io-client"

interface room {
    name: string;
    people: number;
}

const socket:Socket = io(location.origin);

const getrooms = async () => {
    const rooms = <HTMLDivElement>document.getElementById("room_con");
    rooms.innerHTML = "";

    const res = await fetch("/getrooms");
    const data:room[] = await res.json();

    for(let i of data){
        const div = document.createElement("div");
        div.innerHTML = `${i.name}<br>${i.people}명 참가중`;
        div.classList.add("room");
        rooms.appendChild(div);
    }
}

socket.on("room", async () => {
    await getrooms();
})