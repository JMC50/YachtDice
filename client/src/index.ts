import { io, Socket } from  "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

const socket:Socket = io(location.origin);

// getimg?name=dices
const scorecard = document.querySelector('.scorecard')
const gameCon = document.querySelector('.gameCon')
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

for(let i of values){
    const tr = document.createElement("tr");

    const td1 = document.createElement("td");
    td1.classList.add('td1')
    td1.innerHTML = i;
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

const dices = ['dice1','dice2','dice3','dice4','dice5']
for(let i of dices){
    const dice = document.createElement('div')
    dice.classList.add(`${i}`, 'dice')
    gameCon.appendChild(dice)
}

btn.onclick = () =>{
    const allDice  = document.querySelectorAll('.dice')
    console.log(allDice)
    for(let i of allDice){
        i.classList.remove('num1','num2','num3','num4','num5','num6')
        const random = Math.floor(Math.random() * 6 + 1)
        i.classList.add(`num${random}`)
    }
}

