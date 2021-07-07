Moralis.initialize("VENnpo7F7P2IjpTpzdSxwbzbJ8XvfsZg8r8P01yC"); // Application id from moralis.io
Moralis.serverURL = "https://xmhlcuysesnk.moralis.io:2053/server"; //Server url from moralis.io

const SHIBA_WARS = "0xfA624559a5213e36b7e987A74a77DCfCd459a89b";
const ARENA = "0xb95c180198bf7a6ab82265600974059641b4E876";
const FACTORY = "0x92CC9852015afabc3E9235feB7B82c080305439A";

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
    let arenaContract = await getArenaContract();
    
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
        let canFight = await arenaContract.methods.canFight(shibaId).call({from: ethereum.selectedAddress});
        renderShiba(shibaId, data, userPowerTreats, shibaMaxHp, canFight);
    });
}

function renderShiba(id, data, userPowerTreats, shibaMaxHp, canFight){
    // 13 doge pack
    let card = 
    `<div class="col-md-4 card id="pet-${id}">
    <img class="card-img-top" src="img/token-${data.tokenId}.png">
    <div class="card-body">
        <div>Id: <span class="shiba-id">${id}</span></div>
        <div>Name: <span class="shiba-name">${getName(data.tokenId)}</span></div>
        <div>Description: <span class="shiba-description">${getDescription(data.tokenId)}</span></div>`;
    if(data.tokenId != 13) {
        card += `<div>Level: <span class="shiba-level">${data.level}</span></div>
        <div>Strength: <span class="shiba-strength">${parseFloat (data.strength) / 100}</span></div>
        <div>Agility: <span class="shiba-agility">${parseFloat (data.agility) / 100}</span></div>
        <div>Dexterity: <span idclass="shiba-dexterity">${parseFloat (data.dexterity) / 100}</span></div>
        <div>Hitpoints: <span idclass="shiba-hp">${parseFloat (data.hitPoints) / 100} / ${parseFloat (shibaMaxHp) / 100}</span></div>
        <div>Score: <span idclass="arena-score">${data.arenaScore}</span></div>`;
        if(userPowerTreats >= data.level * 1500000) {
            card += `<button id="btn-level-up-${id}" class="btn btn-primary btn-block">Level up</button>`;
        }
        if(data.inArena == 0 && data.hitPoints > 1 && canFight) {
            card += `<button id="btn-queue-${id}" class="btn btn-primary btn-block">Queue to arena</button>`;
            card += `<button id="btn-matchmake-${id}" class="btn btn-primary btn-block">Find a match</button>`;
        } else {
            if(data.hitPoints == 1) {
                card += `This doge is too exhausted to fight.`;
            } else if (!canFight) {
                card += `This doge can not fight.`;
            } else {
                card += `This doge is waiting for a match.`;
            }
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
        if(data.inArena == 0 && data.hitPoints > 1 && canFight) {
            $(`#btn-queue-${id}`).click( () => { 
                queueToArena(id);
            });
            $(`#btn-matchmake-${id}`).click( () => { 
                matchmake(id);
            });
        }
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
            renderGame();
        }));
}

async function queueToArena(shibaId) {
    let contract = await getArenaContract();
    contract.methods.queueToArena(shibaId).send({from: ethereum.selectedAddress})
        .on("receipt", (() => {
            renderGame();
        }));
}

async function matchmake(shibaId) {
    let contract = await getArenaContract();
    contract.methods.matchmake(shibaId).send({from: ethereum.selectedAddress, gasLimit: "3000000"})
        .on("receipt", (() => {
            renderGame();
        }));
}

async function openPack(shibaId) {
    let contract = await getFactoryContract();
    contract.methods.openPack(shibaId).send({from: ethereum.selectedAddress})
        .on("receipt", (() => {
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
    contract.methods.buyTreats().send({from:  ethereum.selectedAddress})
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

function getDescription(tokenId) {
    if (tokenId == 0) {
        return "Altough he's not a Shiba, do not mess with him. The warden of order.";
    } else if (tokenId == 1) {
        return "She may be cute, but she will get you. Beware, she bites.";
    } else if (tokenId == 2) {
            return "The one who has power over all the dogs. We look up to you and believe in you.";
    } else if (tokenId == 3) {
        return "The true holders of the ShibArmy.";
    } else if (tokenId == 4) {
        return "They were here since the beginning. The true loyal ones.";
    } else if (tokenId == 5) {
        return "Altough they may not be recognized, they do lead the ShibArmy forward.";
    } else if (tokenId == 6) {
        return "One bark, and they are in the battle.";
    } else if (tokenId == 7) {
        return "This is not a shiba. But a small cute doge needs a big strong DOG to defend it.";
    } else if (tokenId == 8) {
        return "Put the doge on the leash. Even though the doges hold together, Doge Killer is true to its beliefs.";
    } else if (tokenId == 9) {
        return "Just look at it! How can you not want to own them all?";
    } else if (tokenId == 10) {
        return "A copy cat? NO! Just another cute Inu family member!";
    } else if (tokenId == 11) {
        return "Do you even know this one? If you don't, just look at it!";
    } else if (tokenId == 12) {
        return "AWWWWWWWWWWWWWWWWWW";
    } else if (tokenId == 13) {
        return "Open for a chance to get a very rare Doge, including the WoofMeister themself.";
    } else if (tokenId == 14) {
        return "A friend should always underestimate your virtues and an enemy overestimate your faults.";
    } else if (tokenId == 15) {
        return "We all are in it. AND THIS ONE IS GOLDEN!";
    } else if (tokenId == 16) {
        return "The one who took us under their wings. Ryoshi.";
    } 
    return "";
}

function getName(tokenId) {
    if (tokenId == 0){
        return "Bojar da Killa";
    } else if (tokenId == 1) {
        return "Kaya the Wolf Mother";
    } else if (tokenId == 2) {
        return "WoofMeister";
    } else if (tokenId == 3) {
        return "Shiba Whale";
    } else if (tokenId == 4) {
        return "OG Shiba";
    } else if (tokenId == 5) {
        return "Shiba Warlord";
    } else if (tokenId == 6) {
        return "Shiba General";
    } else if (tokenId == 7) {
        return "Watchdog";
    } else if (tokenId == 8) {
        return "Doge Killer";
    } else if (tokenId == 9) {
        return "Shiba Inu";
    } else if (tokenId == 10) {
        return "Akita Inu";
    } else if (tokenId == 11) {
        return "Sanshu Inu";
    } else if (tokenId == 12) {
        return "Shiba Pup";
    } else if (tokenId == 13) {
        return "Lucky Doge Pack Gen #1";
    } else if (tokenId == 14) {
        return "Doge Father";
    } else if (tokenId == 15) {
        return "Golden Doge";
    } else if (tokenId == 16) {
        return "Ryoshi";
    }
    return "";
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