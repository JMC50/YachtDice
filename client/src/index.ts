import { io, Socket } from  "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

const socket:Socket = io(location.origin);

// getimg?name=dices

interface dice {
    name: string;
    num: number;
    div: HTMLDivElement;
}

const scorecard:HTMLTableElement = document.querySelector('.scorecard')
const gameCon:HTMLDivElement = document.querySelector('.gameCon')
const dicePos = {
    num1: [4, 25],
    num2: [4, 72],
    num3: [51, 25],
    num4: [51, 72],
    num5: [96, 25],
    num6: [96, 72]
}



const btn:HTMLButtonElement = document.querySelector('button')

const values = ["Ones", "Twos", "Threes", "Fours", "Fives", "Sixes","Sum","BONUS","Choice", "4 of a kind", "Full House", "Little Straight", "Big Straight", "Yacht","TOTAL"];
let game_data:any;

(() => {
    const json = {};
    for(let i of values){
        json[i.replaceAll(" ", "_")] = "";
    }
    game_data = json;
    console.log(game_data);
})();

for(let i of values){
    const tr = document.createElement("tr");

    const td1 = document.createElement("td");
    td1.classList.add('td1')
    td1.innerHTML = i;
    tr.classList.add(`${i.replaceAll(" ", "_")}`);
    tr.appendChild(td1);
    const td2 = document.createElement("td");
    td2.classList.add('td2')
    tr.appendChild(td2);
    const td3 = document.createElement("td");
    td3.classList.add('td3')
    tr.appendChild(td3);

    tr.classList.add(`${i.replaceAll(" ", "_")}`);
    scorecard.appendChild(tr);
}

const dices:dice[] = [];
const temp = ['dice1','dice2','dice3','dice4','dice5'];

for(let i of temp){
    const dice = document.createElement('div')
    dice.classList.add(`${i}`, `dice`)
    gameCon.appendChild(dice);
    dices.push({
        name: i,
        num: 0,
        div: dice
    })

}

socket.on("room", async () => {
    console.log("room");
})

btn.onclick = () =>{
    try{
        const divs = document.querySelectorAll(".select");
        for(let i of divs){
            i.remove();
        }
    }catch(e){}
    for(let i of dices){
        const random = Math.floor(Math.random() * 6) + 1;
        i.num = random;
        i.div.classList.value = "dice";
        i.div.classList.add(`num${random}`);
    }
    check();
}

const check_numbers = () => {
    for(let i = 0; i < 6; i++){
        const divs = document.querySelectorAll(`.num${i+1}`);
        console.log(divs)
        const tr:HTMLTableRowElement = document.querySelector(`.${values[i]}`);
        const td:HTMLTableCellElement = tr.querySelector(".td2");
        if(!td.classList.contains("valid")){
            const div = document.createElement("div");
            div.classList.add("select");
            const number = divs.length * (i + 1);
            div.innerHTML = `${number}`;
            if(number !== 0){
                td.appendChild(div);
            }
        }
        console.log(dices);
    }
}

scorecard.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if(target.nodeName == "DIV"){
        if(target.classList.contains("select")){
            const number = target.innerHTML;
            const parent = target.parentElement;
            const tr = parent.parentElement;
            
            const selects = document.querySelectorAll(".select");
            for(let i of selects){
                i.remove();
            }
            
            const div = document.createElement("div");
            div.innerHTML = number;
            game_data[tr.classList.value] = number;
            console.log(game_data);
            parent.classList.add("valid");
            parent.appendChild(div);
        }
    }
})








const check = () => {
    //Ones 체크
    check_numbers();

}