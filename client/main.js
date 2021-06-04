Moralis.initialize("VENnpo7F7P2IjpTpzdSxwbzbJ8XvfsZg8r8P01yC"); // Application id from moralis.io
Moralis.serverURL = "https://xmhlcuysesnk.moralis.io:2053/server"; //Server url from moralis.io

const CONTRACT_ADDRESS = "0x0B0aa55e4CF8371D43193f120eB68AB5552cb7F5";
const SHIB_ADDRESS = "0x6258D3497B01A273620Ed138d4F214661a283Eb4";
const SHIB_SUPPLY = 1000000000000000;

async function init() {
    try {
        let user = Moralis.User.current();
        if(!user){
            $("#login_button").click(async () => {
                user = await Moralis.Web3.authenticate();
            })
        }
        renderGame();
    } catch (error) {
        console.log(error);
    }
}

async function renderGame(){
    $("#game").show();
    $("#shibas-row").html("");

    window.web3 = await Moralis.Web3.enable();

    let allowance = await getAllowance();
    if (allowance > 0) {
        console.log(allowance);
        $("#approve-row").hide();
        $("#buy-shiba-row").show();
    } else {
        $("#approve-row").show();
        $("#buy-shiba-row").hide();
    }

    let contract = await getContract();
    let userShibas = await contract.methods.getUserTokens(ethereum.selectedAddress).call({from: ethereum.selectedAddress});
    if(Array.length == 0){
        return;
    }

    let userPowerTreats = await contract.methods.userPowerTreatTokens(ethereum.selectedAddress).call({from: ethereum.selectedAddress});

    userShibas.forEach(async (shibaId) => {
        let data = await contract.methods.getTokenDetails(shibaId).call({from: ethereum.selectedAddress});
        renderShiba(shibaId, data, userPowerTreats);
    });

    let userBalance = await contract.methods.userShibBalance(ethereum.selectedAddress).call({from: ethereum.selectedAddress});
    $("#shib-balance").html(numberWithCommas(userBalance));

    let prizepool = await contract.methods.userShibBalance(CONTRACT_ADDRESS).call({from: ethereum.selectedAddress});
    $("#shib-prizepool").html(numberWithCommas(prizepool));

    $("#login_button").hide();
}

function renderShiba(id, data, userPowerTreats){
    // 13 doge pack
    // 17 power treat
    let card = 
    `<div class="col-md-4 card id="pet-${id}">
    <img class="card-img-top" src="img/token-${data.tokenId}.png">
    <div class="card-body">
        <div>Id: <span class="shiba-id">${id}</span></div>
        <div>Name: <span class="shiba-name">${data.name}</span></div>
        <div>Description: <span class="shiba-description">${data.description}</span></div>`;
    if(data.tokenId != 13 && data.tokenId != 17) {
        card += `<div>Level: <span class="shiba-level">${data.level}</span></div>
        <div>Strength: <span class="shiba-strength">${parseFloat (data.strength) / 10}</span></div>
        <div>Agility: <span class="shiba-agility">${parseFloat (data.agility) / 10}</span></div>
        <div>Dexterity: <span idclass="shiba-dexterity">${parseFloat (data.dexterity) / 10}</span></div>`;
        if(userPowerTreats == data.level) {
            card += `<button id="btn-level-up-${id}" class="btn btn-primary btn-block">Level up</button>`;
        }
    } else if (data.tokenId == 13) {
        card += `<button id="btn-open-${id}" class="btn btn-primary btn-block">Open</button>`;
    }
    card += `</div></div>`;

    let element = $.parseHTML(card);
    $("#shibas-row").append(element);

    if(data.tokenId != 13 && data.tokenId != 17) {
        $(`#btn-level-up-${id}`).click( () => { 
            levelUp(id);
        });
    } else if (data.tokenId == 13) {
        $(`#btn-open-${id}`).click( () => { 
            openPack(id);
        });
    }
}

function numberWithCommas(x) {
    return x.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

async function getContract(){
    let abi = await getAbi();
    return new web3.eth.Contract(abi, CONTRACT_ADDRESS);
}

function getAbi(){
    return new Promise((res)=>{
        $.getJSON("Token.json", ((json) => {
            res(json.abi);
        }))
    })
}

function shibaAbi(){
    return new Promise((res)=>{
        $.getJSON("ShibaInu.json", ((json) => {
            res(json.abi);
        }))
    })
}

async function getShibContract(){
    let abi = await shibaAbi();
    return new web3.eth.Contract(abi, SHIB_ADDRESS);
}

async function levelUp(shibaId) {
    let contract = await getContract();
    contract.methods.levelUp(shibaId).send({from: ethereum.selectedAddress})
        .on("receipt", (() => {
            console.log("level up");
            renderGame();
        }));
}

async function openPack(shibaId) {
    let contract = await getContract();
    contract.methods.openPack(shibaId).send({from: ethereum.selectedAddress})
        .on("receipt", (() => {
            console.log("level up");
            renderGame();
        }));
}

async function buyShiba(tokenId){
    let contract = await getContract();
    contract.methods.buyShiba(tokenId).send({from:  ethereum.selectedAddress})
        .on("receipt", (() => {
            renderGame();
        }));
}

async function approveShib(){
    let contract = await getShibContract();
    contract.methods.approve(CONTRACT_ADDRESS, SHIB_SUPPLY).send({from: ethereum.selectedAddress})
        .on("receipt", (() => {
            renderGame();
        }));
}

async function getAllowance() {
    let contract = await getShibContract();
    let allowance = await contract.methods.allowance(ethereum.selectedAddress, CONTRACT_ADDRESS).call({from: ethereum.selectedAddress});
    return allowance;
}

init();