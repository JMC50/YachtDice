import { io, Socket } from  "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

const socket:Socket = io(location.origin);

// getimg?name=dices

interface dice {
    name: string;
    num: number;
    div: HTMLDivElement;
    hold: boolean;
}

let roll = false;

const scorecard:HTMLTableElement = document.querySelector('.scorecard')
const gameCon:HTMLDivElement = document.querySelector('.gameCon');
const turn:HTMLDivElement = document.querySelector(".turn");
const roomId:string = location.href.split("=")[1].split("&")[0];
const me:string = location.href.split("player=")[1];

(() => {
    if(me == "player1"){
        turn.innerHTML = "내 턴입니다\n"
    }else{
        turn.innerHTML = "상대 턴입니다\n"
    }
})()

const dicePos = {
    num1: [4, 25],
    num2: [4, 72],
    num3: [51, 25],
    num4: [51, 72],
    num5: [96, 25],
    num6: [96, 72]
}
const btn:HTMLButtonElement = document.querySelector('button')
const values = ["Ones", "Twos", "Threes", "Fours", "Fives", "Sixes","Sum","BONUS","Chance","Four of a kind", "Full House", "Little Straight", "Big Straight", "Yacht","TOTAL"];
let game_data:any;

let rollNum = 3;

let hold:HTMLElement[] = [];

let dices:dice[] = [];
const temp = ['dice1','dice2','dice3','dice4','dice5'];

(() => {
    const json:any = {};
    for(let i of values){
        json[i.replaceAll(" ", "_")] = "";
    }
    game_data = json;
})();
let checkNum = 0
for(let i of values){
    
    const tr = document.createElement("tr");
    if(checkNum < 6){
        tr.classList.add('Nums')
    }

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
    checkNum++
}

// 주사위 리셋
const reset = () => {
    const temp_dices = document.querySelectorAll(".dice");
    if(temp_dices){
        dices = [];
        roll = false;
        for(let i of temp_dices){
            i.remove();
        }
        hold = [];
    }
    for(let i of temp){
        const dice = document.createElement('div')
        dice.classList.add(`${i}`, `dice`)
        gameCon.appendChild(dice);
        dice.dataset.name = i;
        dices.push({
            name: i,
            num: 0,
            div: dice,
            hold: false
        })
    }
}
reset();

//버튼 클릭 받아옴
btn.addEventListener("click", async () => {
    const res_people = await fetch(`/getroompeople?id=${roomId}`);
    const people_data = await res_people.json();
    if(people_data.people == 1){
        return alert("상대가 아직 들어오지 않았습니다.");
    }

    const res_turn = await fetch(`/getturn?id=${roomId}`);
    const turn_data = await res_turn.json();
    if(turn_data.turn !== me){
        return alert("상대의 턴입니다.");
    }

    roll = true;
    if(rollNum > 0){
        rollNum--
        turn.innerHTML = `남은 턴 : ${rollNum}`;
        try{
            const divs = document.querySelectorAll(".select");
            for(let i of divs){
                i.remove();
            }
        }catch(e){}
        for(let i of dices){
            if(!i.hold){
                const random = Math.floor(Math.random() * 6) + 1;
                i.num = random;
                i.div.classList.add("dice");
                const find = i.div.classList.value.match(/num[0-9]/g);
                if(find !== null){
                    for(let name of find){
                        i.div.classList.remove(name);
                    }   
                }
                i.div.classList.add(`num${random}`);
            }
        }
        socket.emit("change_dice", dices, roomId);
        check();
        
    }else{
        alert("모든 주사위 굴리기 턴을 다 사용하셨습니다.");
    }
})

// Ones ~ Sixes 까지 규칙 확인
const check_numbers = () => {
    for(let i = 0; i < 6; i++){
        const divs = document.querySelectorAll(`.num${i+1}`);
        const tr:HTMLTableRowElement = document.querySelector(`.${values[i]}`);
        const td:HTMLTableCellElement = tr.querySelector(".td2");
        if(!td.classList.contains("valid")){
            const div = document.createElement("div");
            div.classList.add("select");
            const number = divs.length * (i + 1);
            div.innerHTML = `${number}`;
            td.appendChild(div);
        }
    }
}

//모든 칸을 확인해서 게임이 끝났는지 확인
const check_end = async () => {
    let my_score = 0;
    let enemy_score = 0;
    for(let i of values){
        const find = document.querySelector(`.${i.replaceAll(" ", "_")}`);

        const find2 = find.querySelector(".td2");
        const find3 = find2.querySelector("div");
        console.log(find3);
        if(find3){
            my_score++;
        }

        const find4 = find.querySelector(".td3");
        const find5 = find4.querySelector("div");
        console.log(find5);
        if(find5){
            enemy_score++;
        }
    }
    console.log(my_score, enemy_score);
    if(my_score == 15 && enemy_score == 15){
        const total = document.querySelector('.TOTAL');
        const me1 = total.querySelector('.td2');
        const myscore = me1.querySelector("div").innerHTML;
        const enemy1 = total.querySelector(".td3");
        const enemyscore = enemy1.querySelector("div").innerHTML;

        if(myscore > enemyscore){
            alert(`이겼습니다!!!\n최종 스코어 = ${myscore} : ${enemyscore}`);
        }else if(myscore < enemyscore){
            alert(`아쉽네요 ㅠㅠ\n최종 스코어 = ${myscore} : ${enemyscore}`);
        }else{
            alert(`비겼습니다!\n최종 스코어 = ${myscore} : ${enemyscore}`);
        }
        socket.emit("game_end", roomId);

        await fetch(`/resetgame?id=${roomId}`)

        const a = document.createElement("a");
        a.href = location.href.split("client")[0] + `mainpage?seat=${roomId}`;
        a.click();
        return true;
    }
}

//숫자 선택
let allNum = 0
let BonusNum = 0;
const BonusTr = document.querySelector('.BONUS')
const Bonus = BonusTr.querySelector('.td2');
const Bonusdiv = document.createElement("div")
Bonusdiv.innerHTML = String(BonusNum);
Bonus.appendChild(Bonusdiv)
allNum += BonusNum
scorecard.addEventListener("click", async (e) => {
    const target = e.target as HTMLElement;
    if(target.nodeName == "DIV"){
        if(target.classList.contains("select")){
            await fetch(`/changeturn?id=${roomId}`);

            const number = target.innerHTML;
            const parent = target.parentElement;
            const tr = parent.parentElement;
            
            const selects = document.querySelectorAll(".select");
            for(let i of selects){
                i.remove();
            }

            reset();
            hold = [];
            
            const div = document.createElement("div");
            div.innerHTML = number;
            allNum += Number(number)
            game_data[tr.classList.value] = number;
            parent.classList.add("valid");
            parent.appendChild(div);
            rollNum = 3;
            turn.innerHTML = `남은 턴 : ${rollNum}`;

            
            
            
            const NumsTotal = document.querySelectorAll('.Nums');
            let NumsTotalNum = 0
            for(let i of NumsTotal){
                const TotalNum = i.querySelector('.td2');
                const Totaldiv = TotalNum?.querySelector('div')
                if(Totaldiv){
                    console.log(Totaldiv.innerHTML)
                    NumsTotalNum += Number(Totaldiv.innerHTML)
                }
                
            }
            const SumTr = document.querySelector('.Sum')
            const Sum = SumTr.querySelector('.td2');
            const Sumtext = document.createElement("div")
            Sum.innerHTML = ''
            Sumtext.innerHTML = `${NumsTotalNum}`;
            Sum.appendChild(Sumtext)

            const BonusTr = document.querySelector('.BONUS')
            const Bonus = BonusTr.querySelector('.td2');
            
            if(NumsTotalNum >= 63){
                BonusNum = 35
                const Bonusdiv = document.createElement("div")
                Bonusdiv.innerHTML = String(BonusNum);
                Bonus.appendChild(Bonusdiv)
                allNum += BonusNum
            }
            const total = document.querySelector('.TOTAL');
            const totalNum = total.querySelector('.td2');
            const text = document.createElement("div");
            totalNum.innerHTML = ''
            text.innerHTML = `${allNum}`;
            totalNum.appendChild(text);
            

            const map = mk_map();
            console.log(map);
            socket.emit('change', roomId, JSON.stringify(Array.from(map)));
            
            // 모든 칸을 체크하여 게임이 끝났는지 확인
            await check_end();
        }
    }
})

const mk_map = () => {
    const map = new Map<string, string>();

    for(let i of values){
        const find = document.querySelector(`.${i.replaceAll(" ", "_")}`);
        const find2 = find.querySelector('.td2');
        const find3 = find2.querySelector("div");
        if(find3){
            map.set(i, find3.innerHTML);
        }else{
            map.set(i, "");
        }
    }

    return map;
}

socket.on('enemy_change', async (roomID:string, t_map:any) => {
    if(roomID !== roomId) return;
    
    const map = new Map(JSON.parse(t_map))
    console.log(map);
    for(let i of values){
        const value = map.get(i) as string;
        const find = document.querySelector(`.${i.replaceAll(" ", "_")}`);
        if(find){
            const find2 = find.querySelector('.td3');
            find2.innerHTML = "";
            if(value !== ""){
                const div = document.createElement("div");
                div.innerHTML = value;
                find2.appendChild(div);
            }
        }else{
            console.log(find);
        }
    }
    reset();

    const res = await check_end()
    if(!res){
        turn.innerHTML = "내 턴입니다\n남은 턴 : 3";
        alert("내 차례");
    }
})

socket.on("enemy_change_dice", (t_dices:dice[], roomID:string) => {
    if(roomId !== roomID) return;

    for(let i in dices){
        dices[i].num = t_dices[i].num;
        dices[i].div.classList.add("dice");
        const find = dices[i].div.classList.value.match(/num[0-9]/g);
        if(find !== null){
            for(let name of find){
                dices[i].div.classList.remove(name);
            }   
        }
        dices[i].div.classList.add(`num${t_dices[i].num}`);
    }
})


//hold
gameCon.addEventListener("click", e => {
    if(!roll) return;
    const target = <HTMLElement>e.target;
    if(target.nodeName == "DIV" && target.classList.contains("dice")){
        const name = target.dataset.name;
        const index = temp.indexOf(name);
        if(target.classList.contains("hold")){
            target.classList.remove("hold");
            const index2 = hold.indexOf(target);
            hold.splice(index2, 1);
            dices[index].hold = false;
        }else{
            target.classList.add("hold");
            hold.push(target);
            dices[index].hold = true;
        }
    }
})


//Yacht 체크
const check_Yacht = () =>{
    console.log('check_Yacht')

    let YachtNum = dices[0].num
    const tr:HTMLTableRowElement = document.querySelector(`.Yacht`);
    const td:HTMLTableCellElement = tr.querySelector(".td2");
    if(dices.every(m => {return YachtNum == m.num})){
        if(!td.classList.contains("valid")){
            const div = document.createElement("div");
            div.classList.add("select");
            let number = 50;
            div.innerHTML = `${number}`;
            if(number !== 0){
                td.appendChild(div);
            }
        }
    }else{
        if(!td?.querySelector("div")?.innerHTML){
            const div = document.createElement("div");
            div.classList.add("select");
            let number = 0;
            td.innerHTML = ''
            div.innerHTML = `${number}`;
            td.appendChild(div)
        }
    }
}

const check_Chance = () =>{
    console.log('check_Chance')

    let ChanceNum = 0
    const tr:HTMLTableRowElement = document.querySelector(`.Chance`);
    const td:HTMLTableCellElement = tr.querySelector(".td2");
    for(let i of dices){
        ChanceNum += i.num;
    }
    if(!td.classList.contains("valid")){
        const div = document.createElement("div");
        div.classList.add("select");
        td.innerHTML = ''
        div.innerHTML = `${ChanceNum}`;
        td.appendChild(div)
    }else{
        if(!td?.querySelector("div")?.innerHTML){
            const div = document.createElement("div");
            div.classList.add("select");
            let number = 0;
            td.innerHTML = ''
            div.innerHTML = `${number}`;
            td.appendChild(div)
        }
    }
}

const check_Kind = () =>{
    console.log('check_Kind')
    let firstKind = dices[0].num;
    let secondKind = dices[1].num;
    // 4_of_a_kind
    const getKindNum = () =>{
        let KindNum = 0
        const tr:HTMLTableRowElement = document.querySelector(`.Four_of_a_kind`);
        const td:HTMLTableCellElement = tr.querySelector(".td2");
        for(let i of dices){
            KindNum += i.num;
        }
        if(!td.classList.contains("valid")){
            const div = document.createElement("div");
            div.classList.add("select");
            td.innerHTML = ''
            div.innerHTML = `${KindNum}`;
            td.appendChild(div)
        }
    }
    let KindCheck = 0
    const tr:HTMLTableRowElement = document.querySelector(`.Four_of_a_kind`);
        const td:HTMLTableCellElement = tr.querySelector(".td2");
    for(let i of dices){
        if(firstKind == i.num) KindCheck++;
    }
    if(KindCheck == 4){
        getKindNum();
    }else{
        if(!td?.querySelector("div")?.innerHTML){
            const div = document.createElement("div");
            div.classList.add("select");
            let number = 0;
            td.innerHTML = ''
            div.innerHTML = `${number}`;
            td.appendChild(div)
        }
    }
    KindCheck = 0
    for(let i of dices){
        if(secondKind == i.num) KindCheck++;
    }
    if(KindCheck == 4){
        getKindNum();
    }else{
        if(!td?.querySelector("div")?.innerHTML){
            const div = document.createElement("div");
            div.classList.add("select");
            let number = 0;
            td.innerHTML = ''
            div.innerHTML = `${number}`;
            td.appendChild(div)
        }
    }
}

const check_FullHouse = () =>{
    console.log('check_FullHouse')
    let TwoFull = 0;
    let ThreeFull = 0;
    const TwoCheck = () =>{
        for(let i of dices){
            let CheckingNum = i.num;
            TwoFull = 0
            for(let j of dices){
                if(CheckingNum == j.num){
                    TwoFull++
                }
            }
            if(TwoFull == 2){
                return true
            }
        }
        return false
    }
    const ThreeCheck = () =>{
        for(let i of dices){
            let CheckingNum = i.num;
            ThreeFull = 0
            for(let j of dices){
                if(CheckingNum == j.num){
                    ThreeFull++
                }
            }
            if(ThreeFull == 3){
                return true
            }
        }
        return false
    }
    const tr:HTMLTableRowElement = document.querySelector(`.Full_House`);
    const td:HTMLTableCellElement = tr.querySelector(".td2");
    if(TwoCheck() && ThreeCheck() && !td.classList.contains("valid")){
        const div = document.createElement("div");
        div.classList.add("select");
        td.innerHTML = ''
        div.innerHTML = `25`;
        td.appendChild(div)
    }else{
        if(!td?.querySelector("div")?.innerHTML){
            const div = document.createElement("div");
            div.classList.add("select");
            let number = 0;
            td.innerHTML = ''
            div.innerHTML = `${number}`;
            td.appendChild(div)
        }
    }
}

const check_LStraight = () =>{
    console.log('check_LStraight')
    const tr:HTMLTableRowElement = document.querySelector(`.Little_Straight`);
    const td:HTMLTableCellElement = tr.querySelector(".td2");
    let NumsList:number[] = [];
    for(let i of dices){
        NumsList.push(i.num)
    }
    NumsList.sort()
    let set = new Set(NumsList);
    let setArr = [...set];
    let CheckingNum = setArr[0] -1;
    console.log(setArr, CheckingNum);
    if(setArr.length === 4){
        if(setArr.every((n) =>{CheckingNum++; console.log(CheckingNum == n); return CheckingNum == n})){
            if(!td.classList.contains("valid")){
                const div = document.createElement("div");
                div.classList.add("select");
                td.innerHTML = ''
                div.innerHTML = `15`;
                td.appendChild(div)
            }
        }else{
            if(!td?.querySelector("div")?.innerHTML){
                const div = document.createElement("div");
                div.classList.add("select");
                let number = 0;
                td.innerHTML = ''
                div.innerHTML = `${number}`;
                td.appendChild(div)
            }
        }
    }else{
        NumsList = [];
        for(let i of dices){
            NumsList.push(i.num)
        }
        NumsList.sort()
        NumsList.pop()
        let firstList = NumsList;
        NumsList = [];
        for(let i of dices){
            NumsList.push(i.num)
        }
        NumsList.sort()
        NumsList.shift()
        let secondList = NumsList;
        let FCheckingNum = firstList[0] -1
        let SCheckingNum = secondList[0] -1
        console.log(firstList, secondList)
        if(firstList.every((n) =>{FCheckingNum++; console.log(FCheckingNum == n); return FCheckingNum == n}) || secondList.every((n) =>{SCheckingNum++; console.log(SCheckingNum == n); return SCheckingNum == n})){
            if(!td.classList.contains("valid")){
                const div = document.createElement("div");
                div.classList.add("select");
                td.innerHTML = ''
                div.innerHTML = `15`;
                td.appendChild(div)
            }
        }else{
            if(!td?.querySelector("div")?.innerHTML){
                const div = document.createElement("div");
                div.classList.add("select");
                let number = 0;
                td.innerHTML = ''
                div.innerHTML = `${number}`;
                td.appendChild(div)
            }
        }
    }
    
}

const check_BStraight = () =>{
    console.log('check_BStraight')
    let NumsList:number[] = [];
    for(let i of dices){
        NumsList.push(i.num)
    }
    NumsList.sort()
    console.log(NumsList)
    let CheckingNum = NumsList[0] -1
    const tr:HTMLTableRowElement = document.querySelector(`.Big_Straight`);
    const td:HTMLTableCellElement = tr.querySelector(".td2");
    if(NumsList.every((n) =>{CheckingNum++; console.log(CheckingNum,n); return CheckingNum == n})){
        if(!td.classList.contains("valid")){
            const div = document.createElement("div");
            div.classList.add("select");
            td.innerHTML = ''
            div.innerHTML = `30`;
            td.appendChild(div)
        }
    }else{
        if(!td?.querySelector("div")?.innerHTML){
            const div = document.createElement("div");
            div.classList.add("select");
            let number = 0;
            td.innerHTML = ''
            div.innerHTML = `${number}`;
            td.appendChild(div)
        }
    }
}



const check = () => {
    //Nums 체크
    check_numbers();
    //Yacht
    check_Yacht();
    //Chance
    check_Chance();
    //4 of a kind
    check_Kind();
    //FullHouse
    check_FullHouse();
    //Big Straight
    check_BStraight();
    //Small Straight
    check_LStraight();
}

