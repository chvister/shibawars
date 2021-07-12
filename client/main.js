Moralis.initialize("VENnpo7F7P2IjpTpzdSxwbzbJ8XvfsZg8r8P01yC"); // Application id from moralis.io
Moralis.serverURL = "https://xmhlcuysesnk.moralis.io:2053/server"; //Server url from moralis.io

const SHIBA_WARS = "0x50F844DE2a9f0fa3b8504f789F4e70fd6A71a2b3";
const ARENA = "0x80b9387345506584bB1D7F191c10334650C67CD2";
const FACTORY = "0xD0598e34B21146030456c5a5fD56f33e35f1fB5b";

const SHIB_ADDRESS = "0xAC27f67D1D2321FBa609107d41Ff603c43fF6931";
const LEASH_ADDRESS = "0x70bE14767cC790a668BCF6d0E6B4bC815A1bCf05";
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
    $("#doges-row").html("");

    window.web3 = await Moralis.Web3.enable();

    let allowance = await getAllowance();
    if (allowance > 0) {
        $("#btn-approve-shib").hide();
    } else {
        $("#btn-approve-shib").show();
    }

    allowance = await getLeashAllowance();
    if (allowance > 0) {
        $("#btn-approve-leash").hide();
    } else {
        $("#btn-approve-leash").show();
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
    } else {
        $("#shib-matchmaker").html(0);
    }

    $("#login_button").hide();
    
    let userPowerTreats = await shibaWars.methods.getUserTreatTokens(ethereum.selectedAddress).call({from: ethereum.selectedAddress});
    $("#stt-balance").html(numberWithCommas(userPowerTreats));

    let arenaQueueLength = await arenaContract.methods.getArenaQueueLength().call({from: ethereum.selectedAddress});
    if(arenaQueueLength <= 1) {
        $("#btn-matchmake").hide();
    } else {
        $("#btn-matchmake").show();
    }

    $("#in-arena").html(arenaQueueLength);

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

async function renderShiba(id, data, userPowerTreats, shibaMaxHp, canFight){
    // 13 doge pack
    let card = 
    `<div class="col-md-4 card id="pet-${id}">
    <img class="card-img-top" src="img/token-${data.tokenId}.png">
    <div class="card-body">
        <div>Id: <span class="doge-id">${id}</span></div>
        <div>Name: <span class="doge-name">${getName(data.tokenId)}</span></div>
        <div>Description: <span class="doge-description">${getDescription(data.tokenId)}</span></div>`;
    if(data.tokenId != 13) {
        card += `<div>Level: <span class="doge-level">${data.level}</span></div>
        <div>Strength: <span class="doge-strength">${parseFloat (data.strength) / 100}</span></div>
        <div>Agility: <span class="doge-agility">${parseFloat (data.agility) / 100}</span></div>
        <div>Dexterity: <span idclass="doge-dexterity">${parseFloat (data.dexterity) / 100}</span></div>
        <div>Hitpoints: <span idclass="doge-hp">${parseFloat (data.hitPoints) / 100} / ${parseFloat (shibaMaxHp) / 100}</span></div>
        <div>Score: <span idclass="arena-score">${data.arenaScore}</span></div>`;
        if(userPowerTreats >= data.level * 1500000) {
            card += `<button id="btn-level-up-${id}" class="btn btn-primary btn-block">Level up</button>`;
        }
        let shibaWars = await getContract();
        let maxHp = await shibaWars.methods.getMaxHp(id).call({from: ethereum.selectedAddress});
        if(data.hitPoints < maxHp) {
            let sttNeeded = maxHp - data.hitPoints;
            if(userPowerTreats >= sttNeeded) {
                card += `<button id="btn-feed-${id}" class="btn btn-primary btn-block">Feed this doge (${sttNeeded} Treats)</button>`;
            } else {
                card += `<button id="btn-feed-blocked" class="btn btn-primary btn-block">Need (${sttNeeded} Treats) to feed</button>`;
            }
        }
        if(data.inArena == 0 && data.hitPoints > 1 && canFight) {
            card += `<button id="btn-queue-${id}" class="btn btn-primary btn-block">Queue to arena</button>`;
            let arenaContract = await getArenaContract();
            let dogesInArena = await arenaContract.methods.getArenaQueueLength().call({from: ethereum.selectedAddress});
            let myDoges = await arenaContract.methods.myDogesInArena().call({from: ethereum.selectedAddress})
            if(dogesInArena > myDoges) {
                card += `<button id="btn-matchmake-${id}" class="btn btn-primary btn-block">Find a match</button>`;
            }
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
    $("#doges-row").append(element);

    $(`#btn-feed-${id}`).click( () => { 
        feed(id);
    });

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

async function getLeashContract(){
    let abi = await leashAbi();
    return new web3.eth.Contract(abi, LEASH_ADDRESS);
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

function leashAbi(){
    return new Promise((res)=>{
        $.getJSON("Leash.json", ((json) => {
            res(json.abi);
        }))
    })
}

async function levelUp(shibaId) {
    let contract = await getContract();
    contract.methods.levelUp(shibaId).send({from: ethereum.selectedAddress, gasLimit: 125000})
        .on("receipt", (() => {
            renderGame();
        }));
}

async function feed(shibaId) {
    let contract = await getContract();
    contract.methods.feed(shibaId).send({from: ethereum.selectedAddress})
        .on("receipt", (() => {
            renderGame();
        }));
}

async function queueToArena(shibaId) {
    let contract = await getArenaContract();
    contract.methods.queueToArena(shibaId).send({from: ethereum.selectedAddress, gasLimit: 150000})
        .on("receipt", (() => {
            renderGame();
        }));
}

async function matchmake(shibaId) {
    let contract = await getArenaContract();
    contract.methods.matchmake(shibaId).send({from: ethereum.selectedAddress, gasLimit: 300000})
        .on("receipt", (() => {
            renderGame();
        }));
}

async function createMatch() {
    let contract = await getArenaContract();
    contract.methods.matchmake().send({from: ethereum.selectedAddress, gasLimit: 300000})
        .on("receipt", (() => {
            renderGame();
        }));
}


async function openPack(shibaId) {
    let contract = await getFactoryContract();
    contract.methods.openPack(shibaId).send({from: ethereum.selectedAddress, gasLimit: 350000})
        .on("receipt", (() => {
            renderGame();
        }));
}

async function buyDoge(tokenId){
    let contract = await getFactoryContract();
    contract.methods.buyDoge(tokenId).send({from:  ethereum.selectedAddress, gasLimit: 500000})
        .on("receipt", (() => {
            renderGame();
        }));
}

async function buyLeash(tokenId){
    let contract = await getFactoryContract();
    contract.methods.buyLeash(tokenId).send({from:  ethereum.selectedAddress})
        .on("receipt", (() => {
            renderGame();
        }));
}

async function buyTreatTokens(){
    let contract = await getFactoryContract();
    contract.methods.buyTreats().send({from:  ethereum.selectedAddress, gasLimit: 200000})
        .on("receipt", (() => {
            renderGame();
        }));
}

async function approveShib(){
    let contract = await getShibContract();
    contract.methods.approve(FACTORY, SHIB_SUPPLY).send({from: ethereum.selectedAddress, gasLimit: 50000})
        .on("receipt", (() => {
            renderGame();
        }));
}

async function approveLeash(){
    let contract = await getLeashContract();
    contract.methods.approve(FACTORY, "100000000000000000000000").send({from: ethereum.selectedAddress, gasLimit: 50000})
        .on("receipt", (() => {
            renderGame();
        }));
}


async function getAllowance() {
    let contract = await getShibContract();
    let allowance = await contract.methods.allowance(ethereum.selectedAddress, FACTORY).call({from: ethereum.selectedAddress});
    return allowance;
}

async function getLeashAllowance() {
    let contract = await getLeashContract();
    let allowance = await contract.methods.allowance(ethereum.selectedAddress, FACTORY).call({from: ethereum.selectedAddress});
    return allowance;
}

function getDescription(tokenId) {
    if (tokenId == 0) {
        return "Altough he's not a doge, do not mess with him. The warden of order.";
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
        return "This is not a doge. But a small cute doge needs a big strong DOG to defend it.";
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
    } else if (tokenId == 17) {
        return "Increases the stats of your doge in fight by 15%";
    } else if (tokenId == 18) {
        return "Increases the stats of your doge in fight by 20%";
    } else if (tokenId == 19) {
        return "Increases the stats of your doge in fight by 25%";
    }  else if (tokenId == 20) {
        return "Increases the stats of your doge in fight by 30%";
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
        return "doge Whale";
    } else if (tokenId == 4) {
        return "OG doge";
    } else if (tokenId == 5) {
        return "doge Warlord";
    } else if (tokenId == 6) {
        return "doge General";
    } else if (tokenId == 7) {
        return "Watchdog";
    } else if (tokenId == 8) {
        return "Doge Killer";
    } else if (tokenId == 9) {
        return "doge Inu";
    } else if (tokenId == 10) {
        return "Akita Inu";
    } else if (tokenId == 11) {
        return "Sanshu Inu";
    } else if (tokenId == 12) {
        return "doge Pup";
    } else if (tokenId == 13) {
        return "Lucky Doge Pack Gen #1";
    } else if (tokenId == 14) {
        return "Doge Father";
    } else if (tokenId == 15) {
        return "Golden Doge";
    } else if (tokenId == 16) {
        return "Ryoshi";
    } else if (tokenId == 17) {
        return "Iron Leash";
    } else if (tokenId == 18) {
        return "Silver Leash";
    } else if (tokenId == 19) {
        return "Golden Leash";
    }  else if (tokenId == 20) {
        return "Diamond Leash";
    }
    return "";
}

$("#btn-buy-7").click( () => { 
    buyDoge(7);
});

$("#btn-buy-8").click( () => { 
    buyDoge(8);
});

$("#btn-buy-9").click( () => { 
    buyDoge(9);
});

$("#btn-buy-10").click( () => { 
    buyDoge(10);
});

$("#btn-buy-11").click( () => { 
    buyDoge(11);
});

$("#btn-buy-12").click( () => { 
    buyDoge(12);
});

$("#btn-buy-13").click( () => { 
    buyDoge(13);
});

$("#btn-buy-17").click( () => { 
    buyLeash(17);
});

$("#btn-buy-18").click( () => { 
    buyLeash(18);
});

$("#btn-buy-19").click( () => { 
    buyLeash(19);
});

$("#btn-buy-20").click( () => { 
    buyLeash(20);
});

$("#btn-buy-treat-tokens").click( () => { 
    buyTreatTokens();
});

$("#btn-approve-shib").click( () => { 
    approveShib();
})

$("#btn-approve-leash").click( () => { 
    approveLeash();
})

$("#btn-matchmake").click( () => { 
    createMatch();
})

init();