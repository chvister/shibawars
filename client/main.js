Moralis.initialize("VENnpo7F7P2IjpTpzdSxwbzbJ8XvfsZg8r8P01yC"); // Application id from moralis.io
Moralis.serverURL = "https://xmhlcuysesnk.moralis.io:2053/server"; //Server url from moralis.io

const SHIBA_WARS = "0xf7060ADE1042d5B83F981AAD6F0181993953c51a";
const ARENA = "0x1dD1bF3E4d0fcB0102F72e6CC12b2Fea7E84137D";
const FACTORY = "0x5f5Dce46BE8ed1B58dC6DAA7Ac85ff278FC27b7C";

const SHIB_ADDRESS = "0xAC27f67D1D2321FBa609107d41Ff603c43fF6931";
const LEASH_ADDRESS = "0x70bE14767cC790a668BCF6d0E6B4bC815A1bCf05";
const SHIB_SUPPLY = "1000000000000000000000000000000000";

let treatsToBuy = 1500000;

let shibaWars;
let factoryContract;
let arenaContract;
let shibContrat;
let leashContract;
let userTokens;

let filterId = -1;

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

// detect Metamask account change
ethereum.on('accountsChanged', function (accounts) {
    init()
});

// detect Network account change
ethereum.on('networkChanged', function(networkId){
    init()
});

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

    $("#login_button").hide();

    shibContrat = await getShibContract();
    leashContract = await getLeashContract();
    shibaWars = await getContract();
    factoryContract = await getFactoryContract();
    arenaContract = await getArenaContract();
    
    updateBalances();

    let userPowerTreats = await shibaWars.methods.getUserTreatTokens(ethereum.selectedAddress).call({from: ethereum.selectedAddress});
    userTokens = await shibaWars.methods.getUserTokens(ethereum.selectedAddress).call({from: ethereum.selectedAddress});
    let userLeashes = await filterLeashes(userTokens);

    for(dogeId of userTokens) {
        let data = await shibaWars.methods.getTokenDetails(dogeId).call({from: ethereum.selectedAddress});
        let canFight = await arenaContract.methods.canFight(dogeId).call({from: ethereum.selectedAddress});
        await renderShiba(dogeId, data, userPowerTreats, (parseFloat(data.strength) * 5) + 5000, canFight, userTokens, userLeashes);
    }

}

async function filterLeashes(userTokens) {
    let userLeashes = [];

    for (tokenId of userTokens) {
        let dogeData = await shibaWars.methods.getTokenDetails(tokenId).call({from: ethereum.selectedAddress});
        if(dogeData.tokenId >= 17) {
            let isLeashUsed = await arenaContract.methods.isLeashUsed(tokenId).call({from: ethereum.selectedAddress}); 
            if(!isLeashUsed){
                userLeashes.push([tokenId, dogeData.tokenId])
            }
        }
    }
    return userLeashes;
}

async function renderShiba(id, data, userPowerTreats, shibaMaxHp, canFight, userTokens, userLeashes) {
    // 13 doge pack
    let card = `<div class="col-md-4 card" id="pet-${id}"></div>`

    let element = $.parseHTML(card);

    $("#doges-row").append(element);
    $(`#pet-${id}`).html(await getCardContent(id, data, userPowerTreats, shibaMaxHp, canFight, userTokens, userLeashes));
}

async function getCardContent(id, data, userPowerTreats, shibaMaxHp, canFight, userTokens, userLeashes) {
    let leashedDogeId = 0;
    let card = 
    `<img class="card-img-top" src="img/token-${data.tokenId}.png">
    <div class="card-body">
        <div>Id: <span class="doge-id">${id}</span></div>
        <div>Name: <span class="doge-name">${getName(data.tokenId)}</span></div>
        <div>Description: <span class="doge-description">${getDescription(data.tokenId)}</span></div>`;
    if(data.tokenId != 13 && data.tokenId < 17) {
        card += `<div>Level: <span class="doge-level">${data.level}</span></div>
        <div>Strength: <span class="doge-strength">${parseFloat (data.strength) / 100}</span></div>
        <div>Agility: <span class="doge-agility">${parseFloat (data.agility) / 100}</span></div>
        <div>Dexterity: <span idclass="doge-dexterity">${parseFloat (data.dexterity) / 100}</span></div>
        <div>Hitpoints: <span idclass="doge-hp">${parseFloat (data.hitPoints) / 100} / ${parseFloat (shibaMaxHp) / 100}</span></div>
        <div>Score: <span idclass="arena-score">${data.arenaScore}</span></div>`;
        if(userPowerTreats >= data.level * 150000) {
            card += `<button id="btn-level-up-${id}" class="btn btn-primary btn-block" onClick="levelUp(${id})">Level up (${ksAndMs(data.level * 150000)} Treats)</button>`;
        } else {
            card += `<button id="btn-level-up-${id}" class="btn btn-primary btn-block">Need ${ksAndMs(data.level * 150000)} Treats to level up</button>`;
        }
        if(data.hitPoints < shibaMaxHp) {
            let sttNeeded = shibaMaxHp - data.hitPoints;
            if(userPowerTreats >= sttNeeded) {
                card += `<button id="btn-feed-${id}" class="btn btn-primary btn-block" onClick="feed(${id})">Feed this doge (${sttNeeded} Treats)</button>`;
            } else {
                card += `<button id="btn-feed-blocked" class="btn btn-primary btn-block">Need (${sttNeeded} Treats) to feed</button>`;
            }
        }
        if(data.inArena == 0 && data.hitPoints > 1 && canFight) {
            card += `<button id="btn-queue-${id}" class="btn btn-primary btn-block" onClick="queueToArena(${id})">Queue to arena</button>`;
            let adventureLevel = parseInt(await arenaContract.methods.getAdventureLevel(id).call({from: ethereum.selectedAddress})) + 1;
            card += `<button id="btn-adventure-${id}" class="btn btn-primary btn-block" onclick="goOnAdventure(${id})">Find an adventure (level ${adventureLevel})</button>`;
        } else {
            if(data.hitPoints == 1) {
                card += `This doge is too exhausted to fight.</br>`;
            } else if (!canFight) {
                card += `This doge can not fight.</br>`;
            } else {
                card += `This doge is waiting for a match.</br>`;
            }
        }
        let isLeashed = await arenaContract.methods.isLeashed(id).call({from : ethereum.selectedAddress});
        if(isLeashed) {
            let leashUsed = await arenaContract.methods.getLeashId(id).call({from : ethereum.selectedAddress});
            leashUsed = await shibaWars.methods.getTokenDetails(leashUsed).call({from : ethereum.selectedAddress});
            card += `Leashed by ${getName(leashUsed.tokenId)}`;
            card += `<button id="btn-unleash-${id}" class="btn btn-primary btn-block" onClick="unleash(${id})">Unleash</button>`;
        } else if (userLeashes.length != 0) {
            card += `<div class="dropdown">
            <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Leash your doge
            </button>
            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">`;
            for (leash of userLeashes) {
                card += `<a class="dropdown-item" href="#" onclick="leashDoge(${id}, ${leash[0]})">Leash with ${getName(leash[1])}</a>`;
            }
            card += `</div>
            </div>`;
        }
    } else if (data.tokenId == 13) {
        card += `<button id="btn-open-${id}" class="btn btn-primary btn-block" onClick="openPack(${id})">Open</button>`;
    } else {
        // leash 
        let leashUsed = await arenaContract.methods.isLeashUsed(id).call({from : ethereum.selectedAddress});
        if(leashUsed) {
            leashedDogeId = await arenaContract.methods.getDoge(id).call({from : ethereum.selectedAddress});
            card += `<button id="btn-unleash-${id}" class="btn btn-primary btn-block" onClick="unleash(${leashedDogeId});">Unleash</button>`;
        } else {
            card += `<div class="dropdown">
            <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Leash your doge
            </button>
            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">`;
            for (dogeId of userTokens) {
                let isLeashed = await arenaContract.methods.isLeashed(dogeId).call({from : ethereum.selectedAddress});
                if(!isLeashed){
                    let dogeData = await shibaWars.methods.getTokenDetails(dogeId).call({from: ethereum.selectedAddress});
                    if(dogeData.tokenId < 17 && dogeData.tokenId != 13) {
                        card += `<a class="dropdown-item" href="#" onclick="leashDoge(${dogeId}, ${id})">Leash ${getName(dogeData.tokenId)} #${dogeId}</a>`;
                    }
                }
            }
            card += `</div>
          </div>`;
        }
    }
    card += `</div>`;

    return card;
}

async function updateShiba(dogeId) {
    let userTokens = await shibaWars.methods.getUserTokens(ethereum.selectedAddress).call({from: ethereum.selectedAddress});
    let userLeashes = await filterLeashes(userTokens);
    let userPowerTreats = await shibaWars.methods.getUserTreatTokens(ethereum.selectedAddress).call({from: ethereum.selectedAddress});
    let data = await shibaWars.methods.getTokenDetails(dogeId).call({from: ethereum.selectedAddress});
    let canFight = await arenaContract.methods.canFight(dogeId).call({from: ethereum.selectedAddress});
    let content = await getCardContent(dogeId, data, userPowerTreats, (parseFloat(data.strength) * 5) + 5000, canFight, userTokens, userLeashes);
    $(`#pet-${dogeId}`).html(content);
}

async function addShiba(dogeId) {
    userTokens = await shibaWars.methods.getUserTokens(ethereum.selectedAddress).call({from: ethereum.selectedAddress});
    let userLeashes = await filterLeashes(userTokens);
    let userPowerTreats = await shibaWars.methods.getUserTreatTokens(ethereum.selectedAddress).call({from: ethereum.selectedAddress});
    let data = await shibaWars.methods.getTokenDetails(dogeId).call({from: ethereum.selectedAddress});
    let canFight = await arenaContract.methods.canFight(dogeId).call({from: ethereum.selectedAddress});
    await renderShiba(dogeId, data, userPowerTreats, (parseFloat(data.strength) * 5) + 5000, canFight, userTokens, userLeashes);
}

async function syncTokens() {
    let newUserTokens = await shibaWars.methods.getUserTokens(ethereum.selectedAddress).call({from: ethereum.selectedAddress});
    for(token of newUserTokens) {
        if(!userTokens.includes(token)){
            let data = await shibaWars.methods.getTokenDetails(token).call({from: ethereum.selectedAddress});
            if(filterId == -1 || data.tokenId == filterId) {
                addShiba(token);
            }
        } else {
            updateShiba(token);
        }
    }
}

async function updateBalances() {
    let userBalance = await shibContrat.methods.balanceOf(ethereum.selectedAddress).call({from: ethereum.selectedAddress});
    if(userBalance != 0) {
        $("#shib-balance").html(numberWithCommas(userBalance.substring(0, userBalance.length - 18)));
    }

    let userLeash = await leashContract.methods.balanceOf(ethereum.selectedAddress).call({from: ethereum.selectedAddress});
    if(userLeash != 0) {
        $("#leash-balance").html(numberWithCommas(userLeash.substring(0, userLeash.length - 18)));
    }

    let prizepool = await factoryContract.methods.getPrizePool().call({from: ethereum.selectedAddress});
    if(prizepool != 0) {
        $("#shib-prizepool").html(numberWithCommas(prizepool.substring(0, prizepool.length - 18)));
    }
    prizepool = await factoryContract.methods.getPrizePoolLeash().call({from: ethereum.selectedAddress});
    console.log(prizepool)
    if(prizepool != 0) {
        var first = numberWithCommas(prizepool.substring(0, prizepool.length - 18));
        $("#leash-prizepool").html((first.length == 0 ? "0" : first) +","+ prizepool.substring(prizepool.length - 18, prizepool.length - 14));
    } else {
        $("#leash-prizepool").html(0)
    }

    let userPowerTreats = await shibaWars.methods.getUserTreatTokens(ethereum.selectedAddress).call({from: ethereum.selectedAddress});
    $("#stt-balance").html(numberWithCommas(userPowerTreats));
}

function ksAndMs(number) {
    if (number < 1000) {
        return number;
    } else if (number < 1000000) {
        return (number / 1000) + "K"
    } else if (number < 1000000000) {
        return (number / 1000000) + "M"
    } else if (number < 1000000000000) {
        return (number / 1000000000) + "B"
    } else if (number < 1000000000000000) {
        return (number / 1000000000000) + "T"
    } else {
        return (number / 1000000000000000) + "Q"
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
            updateBalances();
            syncTokens();
        }));
}

async function leashDoge(dogeId, leashId) {
    let contract = await getArenaContract();
    contract.methods.putDogeOnLeash(dogeId, leashId).send({from: ethereum.selectedAddress, gasLimit: 125000})
        .on("receipt", (() => {
            updateShiba(dogeId);
            updateShiba(leashId);
            syncTokens();
        }));
}

async function feed(shibaId) {
    let contract = await getContract();
    contract.methods.feed(shibaId).send({from: ethereum.selectedAddress, gasLimit: 75000})
        .on("receipt", (() => {
            updateShiba(shibaId);
            updateBalances();
        }));
}

async function queueToArena(shibaId) {
    let contract = await getArenaContract();
    contract.methods.queueToArena(shibaId).send({from: ethereum.selectedAddress, gasLimit: 300000})
        .on("receipt", (async (receipt) => {
            if(receipt.events["ArenaFight"] != null) {
                let event = receipt.events["ArenaFight"].returnValues;
                let attacker = await shibaWars.methods.getTokenDetails(event["attackerId"]).call({from: ethereum.selectedAddress});
                let defender = await shibaWars.methods.getTokenDetails(event["defenderId"]).call({from: ethereum.selectedAddress});
                $("#attacker-info").html(`${getName(attacker.tokenId)} #${event["attackerId"]}`);
                $("#defender-info").html(`${getName(defender.tokenId)} #${event["defenderId"]}`);
                if(event["outcome"] == 1) {
                    if(attacker.id == shibaId) {
                        $("#who-won").html("You won")
                    } else {
                        $("#who-won").html("Attacker won")
                    }
                } else if(event["outcome"] == 2) {
                    if(defender.id == shibaId) {
                        $("#who-won").html("You won")
                    } else {
                        $("#who-won").html("Defender won")
                    }
                } else {
                    $("#who-won").html("It was a draw!")
                }
                $("#attacker-damage").html(parseFloat(event["attackerDamage"]) / 100);
                $("#defender-damage").html(parseFloat(event["defenderDamage"]) / 100);
                if(event["defenderDamage"] == 0) {
                    $("#additional-info").html("Defender fainted.");
                } else if (event["defenderDamage"] < event["attackerDamage"] && event["outcome"] == 2) {
                    $("#additional-info").html("Attacker fainted.");
                }
                $("#btn-show-fight").click()
            }
            updateShiba(shibaId);
            updateBalances();
        }));
}

async function unleash(shibaId) {
    let contract = await getArenaContract();
    let leashId = await contract.methods.getLeashId(shibaId).call({from: ethereum.selectedAddress});
    contract.methods.unleashDoge(shibaId).send({from: ethereum.selectedAddress, gasLimit: 60000})
        .on("receipt", (() => {
            updateShiba(shibaId);
            updateShiba(leashId);
            syncTokens();
        }));
}

async function openPack(shibaId) {
    let contract = await getFactoryContract();
    contract.methods.openPack(shibaId).send({from: ethereum.selectedAddress, gasLimit: 350000})
        .on("receipt", (() => {
            $(`#pet-${dogeId}`).remove();
            syncTokens();
        }));
}

async function buyDoge(tokenId){
    let contract = await getFactoryContract();
    contract.methods.buyDoge(tokenId).send({from:  ethereum.selectedAddress, gasLimit: 500000})
        .on("receipt", (() => {
            syncTokens();
        }));
}

async function buyLeash(tokenId){
    let contract = await getFactoryContract();
    contract.methods.buyLeash(tokenId).send({from:  ethereum.selectedAddress, gasLimit: 500000})
        .on("receipt", (() => {
            syncTokens();
        }));
}

async function buyTreats(){
    let contract = await getFactoryContract();
    contract.methods.buyTreats(treatsToBuy).send({from:  ethereum.selectedAddress})
        .on("receipt", (() => {
            updateBalances();
            syncTokens();
        }));
}

async function endLeague(){
    let contract = await getFactoryContract();
    contract.methods.endSeason().send({from:  ethereum.selectedAddress})
        .on("receipt", (() => {
            renderGame();
        }));
}

async function goOnAdventure(dogeId){
    let contract = await getArenaContract();
    contract.methods.goOnAdventure(dogeId).send({from:  ethereum.selectedAddress, gasLimit: 200000})
        .on("receipt", (async (receipt) => {
            let event = receipt.events["AdventureFight"].returnValues;
            let attacker = await shibaWars.methods.getTokenDetails(event["dogeId"]).call({from: ethereum.selectedAddress});
            let defenderName = event["enemyId"] == 0 ? "Watchdog" : (event["enemyId"] == 1 ? "Wolf" : "Bear"); 
            $("#attacker-info").html(`${getName(attacker.tokenId)} #${event["dogeId"]}`);
            $("#defender-info").html(defenderName);
            if(event["reward"] == 0) {
                $("#who-won").html(`${defenderName} won`)
            } else {
                $("#who-won").html("Attacker won")
            } 
            $("#attacker-damage").html(parseFloat(event["dogeStrength"]) / 100);
            $("#defender-damage").html(parseFloat(event["enemyStrength"]) / 100);
            if(event["enemyStrength"] == 0) {
                $("#additional-info").html(`${defenderName} fainted`);
            } else if (event["enemyStrength"] < event["dogeStrength"] && event["reward"] == 0) {
                $("#additional-info").html("Attacker fainted.");
            }
            $("#reward-info").html(`Found ${numberWithCommas(event["reward"])} treats.`);
            $("#btn-show-fight").click()
            updateShiba(dogeId);
            updateBalances();
        }));
}

async function approveShib(){
    let contract = await getShibContract();
    contract.methods.approve(FACTORY, SHIB_SUPPLY).send({from: ethereum.selectedAddress, gasLimit: 50000})
        .on("receipt", (() => {
            $("#btn-approve-shib").hide();
        }));
}

async function approveLeash(){
    let contract = await getLeashContract();
    contract.methods.approve(FACTORY, "100000000000000000000000").send({from: ethereum.selectedAddress, gasLimit: 50000})
        .on("receipt", (() => {
            $("#btn-approve-leash").hide();
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

async function filter(tokenId) {
    if(filter == tokenId) {
        return;
    } else if (tokenId == -1) {
        $("#filter-text").html("Filter tokens");
        // remove all 
        $("#doges-row").html("");
        // add all
        let userPowerTreats = await shibaWars.methods.getUserTreatTokens(ethereum.selectedAddress).call({from: ethereum.selectedAddress});
        userTokens = await shibaWars.methods.getUserTokens(ethereum.selectedAddress).call({from: ethereum.selectedAddress});
        let userLeashes = await filterLeashes(userTokens);

        for(dogeId of userTokens) {
            let data = await shibaWars.methods.getTokenDetails(dogeId).call({from: ethereum.selectedAddress});
            let canFight = await arenaContract.methods.canFight(dogeId).call({from: ethereum.selectedAddress});
            let dogesInArena = await arenaContract.methods.getArenaQueueLength().call({from: ethereum.selectedAddress});
            let myDoges = await arenaContract.methods.myDogesInArena().call({from: ethereum.selectedAddress});
            await renderShiba(dogeId, data, userPowerTreats, (parseFloat(data.strength) * 5) + 5000, canFight, userTokens, dogesInArena, myDoges, userLeashes);
        }
    } else if (filterId == -1) {
        // only remove invalid
        userTokens = await shibaWars.methods.getUserTokens(ethereum.selectedAddress).call({from: ethereum.selectedAddress});

        for(dogeId of userTokens) {
            let data = await shibaWars.methods.getTokenDetails(dogeId).call({from: ethereum.selectedAddress});
            if(data.tokenId != tokenId) {
                $(`#pet-${dogeId}`).remove()
            }
        }
    } else {
        // remove invalid and add valid
        let userPowerTreats = await shibaWars.methods.getUserTreatTokens(ethereum.selectedAddress).call({from: ethereum.selectedAddress});
        userTokens = await shibaWars.methods.getUserTokens(ethereum.selectedAddress).call({from: ethereum.selectedAddress});
        let userLeashes = await filterLeashes(userTokens);

        for(dogeId of userTokens) {
            let data = await shibaWars.methods.getTokenDetails(dogeId).call({from: ethereum.selectedAddress});
            if(data.tokenId != tokenId) {
                $(`#pet-${dogeId}`).remove()
            } else {
                let canFight = await arenaContract.methods.canFight(dogeId).call({from: ethereum.selectedAddress});
                let dogesInArena = await arenaContract.methods.getArenaQueueLength().call({from: ethereum.selectedAddress});
                let myDoges = await arenaContract.methods.myDogesInArena().call({from: ethereum.selectedAddress});
                await renderShiba(dogeId, data, userPowerTreats, (parseFloat(data.strength) * 5) + 5000, canFight, userTokens, dogesInArena, myDoges, userLeashes);
            }
        }
    }
    if(tokenId != -1) {
        $("#filter-text").html(getName(tokenId));
    }
    filterId = tokenId;
}

function getDescription(tokenId) {
    if (tokenId == 0) {
        return "Altough he's not a shiba, do not mess with him. The warden of order.";
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
        return "All doges are family. But this is a doge killer.";
    } else if (tokenId == 8) {
        return "Somebody did something to this shiba.";
    } else if (tokenId == 9) {
        return "Somebody queue him to arena or something...";
    } else if (tokenId == 10) {
        return "A regular dog, ready to fight";
    } else if (tokenId == 11) {
        return "A small cute doggo, but you should better stay away!";
    } else if (tokenId == 12) {
        return "AWWWWWWWWWWWWWWWWWW";
    } else if (tokenId == 13) {
        return "Open for a chance to get a very rare Doge, including the WoofMeister themself.";
    } else if (tokenId == 14) {
        return "A friend should always underestimate your virtues and an enemy overestimate your faults.";
    } else if (tokenId == 15) {
        return "A member of very rare race of golden shiba inus";
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
        return "Shib Whale";
    } else if (tokenId == 4) {
        return "OG doge";
    } else if (tokenId == 5) {
        return "Shib Warlord";
    } else if (tokenId == 6) {
        return "Shib General";
    } else if (tokenId == 7) {
        return "Doge Killer";
    } else if (tokenId == 8) {
        return "Aggresive Shiba Inu";
    } else if (tokenId == 9) {
        return "Bored Shiba Inu";
    } else if (tokenId == 10) {
        return "Shiba Inu";
    } else if (tokenId == 11) {
        return "Aggresive Shiba Pup";
    } else if (tokenId == 12) {
        return "Shib Pup";
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

for (var tokenId of [7, 8, 9, 10, 11, 12, 13, 20, 19, 18, 17]) {
    if(tokenId < 17) {
        $(`#btn-buy-${tokenId}`).attr("onClick",`buyDoge(${tokenId})`);
    } else {
        $(`#btn-buy-${tokenId}`).attr("onClick",`buyLeash(${tokenId})`);
    }
}

for (var tokenId = 0; tokenId <= 20; ++tokenId) {
    $("#filter-buttons").append(`<a class="dropdown-item" href="#" id="filter-${tokenId}" onClick="filter(${tokenId})">${getName(tokenId)}</a>`);
}

$(`#filter-all`).click(()=>{
    filter(-1);
})

$("#buy-stt-form").on('input', function (e) {
    treatsToBuy = $(this).val();
    $("#buy-stt-count").html(numberWithCommas(treatsToBuy))
    $("#buy-stt-price").html(numberWithCommas("" + (parseFloat(treatsToBuy / 10))))
});

$("#btn-buy-treat-tokens").click( () => { 
    buyTreats();
});

$("#btn-approve-shib").click( () => { 
    approveShib();
})

$("#btn-approve-leash").click( () => { 
    approveLeash();
})

$("#btn-end-league").click( () => { 
    endLeague();
})

init();