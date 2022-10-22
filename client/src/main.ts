const container = <HTMLDivElement>document.querySelector("#container");

container.addEventListener("click", e => {
    const target = <HTMLElement>e.target;
    if(target.nodeName == "DIV"){
        if(!target.classList.contains("seat")) return;

        const a = document.createElement("a");
        const url = location.href.split("/client")[0];
        a.href = url + `/mainpage?seat=${target.innerHTML}`;
        a.click();
    }
})