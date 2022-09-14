import { io, Socket } from  "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

interface room {
    name: string;
    people: number;
}

const socket:Socket = io(location.origin);
const room_create = <HTMLButtonElement>document.getElementById("room_create");
const reload = <HTMLButtonElement>document.getElementById("reload");
const input = <HTMLInputElement>document.getElementById("input");
const room_con = <HTMLDivElement>document.getElementById("room_con");

(async() => {
    const value = prompt("비밀번호를 입력해주세요.");
    const res = await fetch(`/login?pw=${value}`);
    const data = await res.json();
    if(!data){
        alert("비밀번호가 맞지 않습니다. 메인페이지로 이동합니다.");
        const a = document.createElement("a");
        a.href = location.href.split("admin")[0] + "main.html";
        a.click();
    }else{
        await getroom();
    }
})();


const getroom = async () => {
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

reload.addEventListener("click", async () => {
    await getroom();
})

room_create.addEventListener("click", async () => {
    room_create.classList.add("none");
    input.classList.remove("none");
})

const mkroom = async () => {
    const res = await fetch(`/mkroom?name=${input.value}`);
    const data = await res.json();
    if(!data){
        alert("방을 만드는데 실패함");
    }
    room_create.classList.remove("none");
    input.classList.add("none");
    socket.emit("room");
    await getroom();
}

input.addEventListener("keydown", async (e) => {
    if(!input.classList.contains("none")){
        if(e.key == "Enter"){
            if(input.value !== ""){
                await mkroom();
            }
        }
    }
})

room_con.addEventListener("contextmenu", async (e) => {
    e.preventDefault();
    const target = <HTMLDivElement>e.target;
    if(target.classList.contains("room")){
        const res = confirm(`${target.innerHTML.split("<br>")[0]}방을 삭제하시겠습니까?`);
        if(res){
            const ress = await fetch(`/rmroom?name=${target.innerHTML.split("<br>")[0]}`);
            const data = await ress.json();
            socket.emit("room");
            if(!data){
                alert("방을 삭제하는데 실패함");
            }
        }
    }
    await getroom();
})