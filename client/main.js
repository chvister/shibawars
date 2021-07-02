Moralis.initialize("VENnpo7F7P2IjpTpzdSxwbzbJ8XvfsZg8r8P01yC"); // Application id from moralis.io
Moralis.serverURL = "https://xmhlcuysesnk.moralis.io:2053/server"; //Server url from moralis.io

const SHIBA_WARS = "0xFBCc3a32d1Fd797475e8FE1A3872d19325fD35b5";
const ARENA = "0x881ed6274e19dF8094168945303De75A0dbB72Aa";
const FACTORY = "0xd291551CD05e42259125c622A4e55f7Dd49b30b5";

const SHIB_ADDRESS = "0xAC27f67D1D2321FBa609107d41Ff603c43fF6931";
const SHIB_SUPPLY = "1000000000000000000000000000000000";

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

    let shibContrat = await getShibContract();

    let shibaWars = await getContract();
    let factoryContract = await getFactoryContract();
    
    let userBalance = await shibContrat.methods.balanceOf(ethereum.selectedAddress).call({from: ethereum.selectedAddress});
    if(userBalance != 0) {
        $("#shib-balance").html(numberWithCommas(userBalance.substring(0, userBalance.length - 18)));
    }

    let prizepool = await factoryContract.methods.getPrizePool().call({from: ethereum.selectedAddress});
    if(prizepool != 0) {
        $("#shib-prizepool").html(numberWithCommas(prizepool.substring(0, prizepool.length - 18)));
    }

    let matchmaker = await factoryContract.methods.getMatchMakerReward().call({from: ethereum.selectedAddress});
    if(matchmaker != 0) {
        $("#shib-matchmaker").html(numberWithCommas(matchmaker.substring(0, matchmaker.length - 18)));
    }

    $("#login_button").hide();
    
    let userPowerTreats = await shibaWars.methods.getUserTreatTokens(ethereum.selectedAddress).call({from: ethereum.selectedAddress});
    $("#stt-balance").html(numberWithCommas(userPowerTreats));

    let userShibas = await shibaWars.methods.getUserTokens(ethereum.selectedAddress).call({from: ethereum.selectedAddress});
    if(Array.length == 0){
        return;
    }

    userShibas.forEach(async (shibaId) => {
        let data = await shibaWars.methods.getTokenDetails(shibaId).call({from: ethereum.selectedAddress});
        let shibaMaxHp = await shibaWars.methods.getMaxHp(shibaId).call({from: ethereum.selectedAddress});
        renderShiba(shibaId, data, userPowerTreats, shibaMaxHp);
    });
}

function renderShiba(id, data, userPowerTreats, shibaMaxHp){
    // 13 doge pack
    let card = 
    `<div class="col-md-4 card id="pet-${id}">
    <img class="card-img-top" src="img/token-${data.tokenId}.png">
    <div class="card-body">
        <div>Id: <span class="shiba-id">${id}</span></div>
        <div>Name: <span class="shiba-name">${data.name}</span></div>
        <div>Description: <span class="shiba-description">${data.description}</span></div>`;
    if(data.tokenId != 13) {
        card += `<div>Level: <span class="shiba-level">${data.level}</span></div>
        <div>Strength: <span class="shiba-strength">${parseFloat (data.strength) / 100}</span></div>
        <div>Agility: <span class="shiba-agility">${parseFloat (data.agility) / 100}</span></div>
        <div>Dexterity: <span idclass="shiba-dexterity">${parseFloat (data.dexterity) / 100}</span></div>
        <div>Hitpoints: <span idclass="shiba-hp">${parseFloat (data.hitPoints) / 100} / ${parseFloat (shibaMaxHp) / 100}</span></div>`;
        if(userPowerTreats >= data.level * 1500000) {
            card += `<button id="btn-level-up-${id}" class="btn btn-primary btn-block">Level up</button>`;
        }
    } else if (data.tokenId == 13) {
        card += `<button id="btn-open-${id}" class="btn btn-primary btn-block">Open</button>`;
    }
    card += `</div></div>`;

    let element = $.parseHTML(card);
    $("#shibas-row").append(element);

    if(data.tokenId != 13) {
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
    let abi = await shibaWarsAbi();
    return new web3.eth.Contract(abi, SHIBA_WARS);
}

async function getArenaContract(){
    let abi = await arenaAbi();
    return new web3.eth.Contract(abi, ARENA);
}

async function getFactoryContract(){
    let abi = await factoryAbi();
    return new web3.eth.Contract(abi, FACTORY);
}

async function getShibContract(){
    let abi = await shibaAbi();
    return new web3.eth.Contract(abi, SHIB_ADDRESS);
}

function shibaWarsAbi(){
    return new Promise((res)=>{
        $.getJSON("ShibaWars.json", ((json) => {
            res(json.abi);
        }))
    })
}

function arenaAbi(){
    return new Promise((res)=>{
        $.getJSON("ShibaWarsArena.json", ((json) => {
            res(json.abi);
        }))
    })
}

function factoryAbi(){
    return new Promise((res)=>{
        $.getJSON("ShibaWarsFactory.json", ((json) => {
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

async function levelUp(shibaId) {
    let contract = await getContract();
    contract.methods.levelUp(shibaId).send({from: ethereum.selectedAddress})
        .on("receipt", (() => {
            console.log("level up");
            renderGame();
        }));
}

async function openPack(shibaId) {
    let contract = await getFactoryContract();
    contract.methods.openPack(shibaId).send({from: ethereum.selectedAddress})
        .on("receipt", (() => {
            console.log("level up");
            renderGame();
        }));
}

async function buyShiba(tokenId){
    let contract = await getFactoryContract();
    contract.methods.buyShiba(tokenId).send({from:  ethereum.selectedAddress})
        .on("receipt", (() => {
            renderGame();
        }));
}

async function buyTreatTokens(){
    let contract = await getFactoryContract();
    contract.methods.buyTreatTokens().send({from:  ethereum.selectedAddress})
        .on("receipt", (() => {
            renderGame();
        }));
}

async function approveShib(){
    let contract = await getShibContract();
    contract.methods.approve(FACTORY, SHIB_SUPPLY).send({from: ethereum.selectedAddress})
        .on("receipt", (() => {
            renderGame();
        }));
}

async function getAllowance() {
    let contract = await getShibContract();
    let allowance = await contract.methods.allowance(ethereum.selectedAddress, FACTORY).call({from: ethereum.selectedAddress});
    return allowance;
}

$("#btn-buy-7").click( () => { 
    buyShiba(7);
});

$("#btn-buy-8").click( () => { 
    buyShiba(8);
});

$("#btn-buy-9").click( () => { 
    buyShiba(9);
});

$("#btn-buy-10").click( () => { 
    buyShiba(10);
});

$("#btn-buy-11").click( () => { 
    buyShiba(11);
});

$("#btn-buy-12").click( () => { 
    buyShiba(12);
});

$("#btn-buy-13").click( () => { 
    buyShiba(13);
});

$("#btn-buy-treat-tokens").click( () => { 
    buyTreatTokens();
});

$("#btn-approve-shib").click( () => { 
    approveShib();
})

init();