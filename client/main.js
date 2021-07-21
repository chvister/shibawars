Moralis.initialize("VENnpo7F7P2IjpTpzdSxwbzbJ8XvfsZg8r8P01yC"); // Application id from moralis.io
Moralis.serverURL = "https://xmhlcuysesnk.moralis.io:2053/server"; //Server url from moralis.io

const SHIBA_WARS = "0xe5d2257776796BAb8D49AC307e9f54eAE113E363";
const ARENA = "0xE8ad8800097c717cB7925E4aD4aa93c6eb93B21C";
const FACTORY = "0x753fb371f5b182C176D45deb82Be71924C30D373";

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
    let leashContract = await getLeashContract();

    let shibaWars = await getContract();
    let factoryContract = await getFactoryContract();
    let arenaContract = await getArenaContract();
    
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

    let matchmaker = await factoryContract.methods.getMatchMakerReward().call({from: ethereum.selectedAddress});
    if(matchmaker != 0) {
        $("#shib-matchmaker").html(numberWithCommas(matchmaker.substring(0, matchmaker.length - 18)));
    } else {
        $("#shib-matchmaker").html(0);
    }

    matchmaker = await factoryContract.methods.getMatchMakerRewardLeash().call({from: ethereum.selectedAddress});
    if(matchmaker != 0) {
        var first = numberWithCommas(matchmaker.substring(0, matchmaker.length - 18));
        $("#leash-matchmaker").html((first.length == 0 ? "0" : first) +","+ matchmaker.substring(matchmaker.length - 18, matchmaker.length - 14));
    } else {
        $("#leash-matchmaker").html(0);
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

    let userTokens = await shibaWars.methods.getUserTokens(ethereum.selectedAddress).call({from: ethereum.selectedAddress});
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

    for(dogeId of userTokens) {
        let data = await shibaWars.methods.getTokenDetails(dogeId).call({from: ethereum.selectedAddress});
        let canFight = await arenaContract.methods.canFight(dogeId).call({from: ethereum.selectedAddress});
        let dogesInArena = await arenaContract.methods.getArenaQueueLength().call({from: ethereum.selectedAddress});
        let myDoges = await arenaContract.methods.myDogesInArena().call({from: ethereum.selectedAddress});
        await renderShiba(dogeId, data, userPowerTreats, (parseFloat(data.strength) * 5) + 5000, canFight, userTokens, dogesInArena, myDoges, userLeashes);
    }

    await arenaContract.getPastEvents('AdventureFight', {
        fromBlock: 16600,
        toBlock: 17000
    }).then(function(events){
        events.forEach((item) => {
            console.log(item)
        });
    });
}

async function renderShiba(id, data, userPowerTreats, shibaMaxHp, canFight, userTokens, dogesInArena, myDoges, userLeashes) {
    let leashedDogeId = 0;
    let arenaContract = await getArenaContract();
    let shibaWars = await getContract();
    // 13 doge pack
    let card = 
    `<div class="col-md-4 card id="pet-${id}">
    <img class="card-img-top" src="img/token-${data.tokenId}.png">
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
            card += `<button id="btn-level-up-${id}" class="btn btn-primary btn-block">Level up</button>`;
        }
        if(data.hitPoints < shibaMaxHp) {
            let sttNeeded = shibaMaxHp - data.hitPoints;
            if(userPowerTreats >= sttNeeded) {
                card += `<button id="btn-feed-${id}" class="btn btn-primary btn-block">Feed this doge (${sttNeeded} Treats)</button>`;
            } else {
                card += `<button id="btn-feed-blocked" class="btn btn-primary btn-block">Need (${sttNeeded} Treats) to feed</button>`;
            }
        }
        if(data.inArena == 0 && data.hitPoints > 1 && canFight) {
            card += `<button id="btn-queue-${id}" class="btn btn-primary btn-block">Queue to arena</button>`;
            let adventureLevel = parseInt(await arenaContract.methods.getAdventureLevel(id).call({from: ethereum.selectedAddress})) + 1;
            card += `<button id="btn-adventure-${id}" class="btn btn-primary btn-block" onclick="goOnAdventure(${dogeId})">Find an adventure (level ${adventureLevel})</button>`;
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
        let isLeashed = await arenaContract.methods.isLeashed(id).call({from : ethereum.selectedAddress});
        if(isLeashed) {
            let leashUsed = await arenaContract.methods.getLeashId(id).call({from : ethereum.selectedAddress});
            leashUsed = await shibaWars.methods.getTokenDetails(leashUsed).call({from : ethereum.selectedAddress});
            card += `Leashed by ${getName(leashUsed.tokenId)}`;
            card += `<button id="btn-unleash-${id}" class="btn btn-primary btn-block">Unleash</button>`;
        } else if (userLeashes.length != 0) {
            card += `<div class="dropdown">
            <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Leash your doge
            </button>
            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">`;
            for (leash of userLeashes) {
                card += `<a class="dropdown-item" href="#" onclick="leashDoge(${leash[0]}, ${leashId})">Leash with ${getName(leash[1])}</a>`;
            }
            card += `</div>
            </div>`;
        }
    } else if (data.tokenId == 13) {
        card += `<button id="btn-open-${id}" class="btn btn-primary btn-block">Open</button>`;
    } else {
        // leash 
        let leashUsed = await arenaContract.methods.isLeashUsed(id).call({from : ethereum.selectedAddress});
        if(leashUsed) {
            leashedDogeId = await arenaContract.methods.getDoge(id).call({from : ethereum.selectedAddress});
            card += `<button id="btn-unleash-${id}" class="btn btn-primary btn-block">Unleash</button>`;
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
                        card += `<a class="dropdown-item" href="#" onclick="leashDoge(${dogeId}, ${id})">Leash ${getName(dogeData.tokenId)}</a>`;
                    }
                }
            }
            card += `</div>
          </div>`;
        }
    }
    card += `</div></div>`;

    let element = $.parseHTML(card);
    $("#doges-row").append(element);

    $(`#btn-feed-${id}`).click( () => { 
        feed(id);
    });

    if(data.tokenId != 13 && data.tokenId < 17) {
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
        $(`#btn-unleash-${id}`).click( () => { 
            unleash(id);
        });
    } else if (data.tokenId == 13) {
        $(`#btn-open-${id}`).click( () => { 
            openPack(id);
        });
    } else {
        $(`#btn-unleash-${id}`).click( () => { 
            unleash(leashedDogeId);
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

async function leashDoge(dogeId, leashId) {
    let contract = await getArenaContract();
    contract.methods.putDogeOnLeash(dogeId, leashId).send({from: ethereum.selectedAddress, gasLimit: 125000})
        .on("receipt", (() => {
            renderGame();
        }));
}

async function feed(shibaId) {
    let contract = await getContract();
    contract.methods.feed(shibaId).send({from: ethereum.selectedAddress, gasLimit: 75000})
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
    contract.methods.matchmake(shibaId).send({from: ethereum.selectedAddress, gasLimit: 400000})
        .on("receipt", (() => {
            renderGame();
        }));
}

async function unleash(shibaId) {
    let contract = await getArenaContract();
    contract.methods.unleashDoge(shibaId).send({from: ethereum.selectedAddress, gasLimit: 60000})
        .on("receipt", (() => {
            renderGame();
        }));
}

async function createMatch() {
    let contract = await getArenaContract();
    contract.methods.matchmake().send({from: ethereum.selectedAddress, gasLimit: 400000})
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
    contract.methods.buyLeash(tokenId).send({from:  ethereum.selectedAddress, gasLimit: 500000})
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

$("#btn-end-league").click( () => { 
    endLeague();
})

init();