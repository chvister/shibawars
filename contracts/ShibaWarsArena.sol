pragma solidity ^0.8.0;

import "./ShibaWarsEntity.sol";
import "./ShibaWarsUtils.sol";
import "./ShibaMath.sol";
import "./IShibaWars.sol";

contract ShibaWarsArena {

    using ShibaMath for uint;
    using ShibaMath for uint64;
    using ShibaMath for bytes;

    mapping (uint256 => uint256) private arenaQueue;

    // leash to doge mapping
    mapping(uint256 => uint256) private dogesOnLeash;
    mapping(uint256 => uint256) private leashUsed;
    mapping(uint256 => uint256) private adventures;

    IShibaWars private shibaWars;

    uint256 constant SEASON_DURATION = 90 * 24 * 60 * 60;
    uint256 constant LEAGUE_DIVISOR = 250;

    event AdventureFight(uint dogeId, uint enemyId, uint dogeStrength, uint enemyStrength, uint reward);
    event ArenaFight(uint attackerId, uint defenderId, uint attackerDamage, uint defenderDamage, uint outcome);

    modifier isSeason() {
        require(block.timestamp >= shibaWars.seasonStart() && block.timestamp <= shibaWars.seasonStart() + SEASON_DURATION,
            "Shiba Wars: Can only be called by Shiba Wars contract!");
        _;
    }

    modifier myToken(uint tokenId) {
        require(shibaWars.ownerOf(tokenId) == msg.sender, "Shiba Wars: YOU DO NOT OWN THIS TOKEN");
        _;
    }

    modifier hasOpponent(uint tokenId) {
        ShibaWarsEntity.Doge memory _shiba = shibaWars.getTokenDetails(tokenId);
        require(arenaQueue[_shiba.arenaScore / LEAGUE_DIVISOR] == 0 || 
            shibaWars.ownerOf(tokenId) != shibaWars.ownerOf(arenaQueue[_shiba.arenaScore / LEAGUE_DIVISOR]), "Shiba Wars: NO OPPONENT READY FOR THIS DOGE");
        _;
    }
 
    constructor (address shibaWars_) {
        shibaWars = IShibaWars(shibaWars_);
    }

    function queueToArena(uint tokenId) public isSeason() hasOpponent(tokenId) {
        checkCanFight(tokenId);
        ShibaWarsEntity.Doge memory _doge = shibaWars.getTokenDetails(tokenId);
        uint enemyId = arenaQueue[_doge.arenaScore / LEAGUE_DIVISOR];
        if(enemyId == 0) {
            shibaWars.setInArena(tokenId, 1);
            arenaQueue[_doge.arenaScore / LEAGUE_DIVISOR] = tokenId;
        } else {
            fight(tokenId, enemyId);
            shibaWars.setInArena(enemyId, 0);
            arenaQueue[_doge.arenaScore / LEAGUE_DIVISOR] = 0;
        }
    }

    function checkCanFight(uint tokenId) private view myToken(tokenId) 
        returns (ShibaWarsEntity.Doge memory _shiba) {
        _shiba = shibaWars.getTokenDetails(tokenId);
        // must be doge
        require(canFight(tokenId), "Shiba Wars: THIS DOGE CAN NOT FIGHT!");
        // can not be in arena
        require(_shiba.inArena == 0, "Shiba Wars: THIS DOGE IS IN ARENA ALREADY");
        require(_shiba.hitPoints > 1, "Shiba Wars: THIS DOGE IS TOO EXHAUSTED");
    }

    function fight(uint256 firstShiba, uint256 secondShiba) private isSeason() {
        require(shibaWars.ownerOf(firstShiba) != shibaWars.ownerOf(secondShiba), "Shiba Wars: CAN NOT FIGHT YOUR OWN DOGE");
        ShibaWarsEntity.Doge memory attacker;
        ShibaWarsEntity.Doge memory defender;
        {
            ShibaWarsEntity.Doge memory _first = shibaWars.getTokenDetails(firstShiba);
            ShibaWarsEntity.Doge memory _second = shibaWars.getTokenDetails(secondShiba);
            // the one with higher agility attacks first
            (attacker, defender) = _first.agility >= _second.agility ? (_first, _second) : (_second, _first);
        }
        (uint attackerUpgrade, uint defenderUpgrade) = (100, 100);
        {
            (uint attackerLeash, uint defenderLeash) = (dogesOnLeash[attacker.id], dogesOnLeash[defender.id]);
            if(attackerLeash != 0) {
                // attacker is leashed
                // every stat is the same so we can pick any for the upgrade
                attackerUpgrade += shibaWars.getTokenDetails(attackerLeash).strength;
            }
            if(defenderLeash != 0) {
                // defender is leashed
                defenderUpgrade += shibaWars.getTokenDetails(defenderLeash).strength;
            }
        }
        uint128 winner = 0;
        // pick random skill for attacker
        uint128 skill = (uint128)(abi.encodePacked(block.timestamp, block.difficulty, firstShiba).random(0, 2));
        uint damageAttacker = skill == 0 ? attacker.strength : (skill == 1 ? attacker.agility : attacker.dexterity);
        damageAttacker = damageAttacker.mul(attackerUpgrade).div(100);
        skill = (uint128)(abi.encodePacked(block.timestamp, block.difficulty, secondShiba).random(0, 2));
        uint damageDefender = skill == 0 ? defender.strength : (skill == 1 ? defender.agility : defender.dexterity);
        damageDefender = damageDefender.mul(defenderUpgrade).div(100);
        if(damageAttacker > defender.hitPoints - 1) {
            // defender fainted
            shibaWars.decreaseHp(defender.id, defender.hitPoints - 1);
            winner = 1;
        } else {
            shibaWars.decreaseHp(defender.id, damageAttacker);
        }
        if (winner == 0) {
            // defender attacks as well
            if(damageDefender > attacker.hitPoints - 1) {
                // defender fainted
                shibaWars.decreaseHp(attacker.id, attacker.hitPoints - 1);
                winner = 2;
            } else {
                shibaWars.decreaseHp(attacker.id, damageDefender);
            }
        }
        if(winner == 0) {
            // nobody fainted
            if (damageAttacker > damageDefender) {
                // attacker did more damage
                winner = 1;
            } else if (damageDefender > damageAttacker) {
                // defender did more damage
                winner = 2;
            }
        }
        if(winner == 1) {
            uint256 score = scoreReward(attacker.arenaScore, defender.arenaScore);
            uint attNewScore = attacker.arenaScore.add(score);
            uint defNewScore = score <= defender.arenaScore - 1 ? defender.arenaScore.sub(score) : 1;
            setScore(attacker.id, attNewScore, defender.id, defNewScore);
        } else if (winner == 2) {
            uint256 score = scoreReward(defender.arenaScore, attacker.arenaScore);
            uint defNewScore = defender.arenaScore.add(score);
            uint attNewScore = score <= attacker.arenaScore - 1 ? attacker.arenaScore.sub(score) : 1;
            setScore(attacker.id, attNewScore, defender.id, defNewScore);
        } else {
            uint256 score = scoreReward(attacker.arenaScore, defender.arenaScore);
            uint attNewScore = attacker.arenaScore.add(score);
            uint defNewScore = score <= defender.arenaScore - 1 ? defender.arenaScore.sub(score) : 1;
            score = scoreReward(defender.arenaScore, attacker.arenaScore);
            defNewScore = defNewScore.add(score);
            attNewScore = score <= attNewScore - 1 ? attNewScore.sub(score) : 1;
            setScore(attacker.id, attNewScore, defender.id, defNewScore);
        }
        emit ArenaFight(attacker.id, defender.id, damageAttacker, damageDefender, winner);
    }

    function scoreReward(uint256 winnerScore, uint256 loserScore) private pure returns (uint256) {
        uint256 multiplier = loserScore.mul(100).div(winnerScore);
        uint256 score = multiplier.mul(25).div(100);
        return score.trim(1, 50);
    }

    function setScore(uint256 attackerId, uint256 attackerScore, uint256 defenderId, uint256 defenderScore) private {
        shibaWars.setScore(attackerId, attackerScore);
        shibaWars.setScore(defenderId, defenderScore);
    }

    // RETURN TRUE IF THIS DOGE CAN FIGHT IN ARENA
    function canFight(uint tokenId) public view returns (bool) {
        uint id =  shibaWars.getTokenDetails(tokenId).tokenId;
        return id > 1 && id != 13 && id < 17;
    }

    function putDogeOnLeash(uint dogeId, uint leashId) public isSeason() myToken(dogeId) myToken(leashId) {
        // doge id must be doge
        require(ShibaWarsUtils.isDoge(shibaWars.getTokenDetails(dogeId).tokenId), "Shiba Wars: CAN ONLY LEASH DOGE");
        // lesah id must be leash
        require(ShibaWarsUtils.isLeash(shibaWars.getTokenDetails(leashId).tokenId), "Shiba Wars: CAN ONLY LEASH WITH A LEASH");
        // doge must not be leashed
        require(dogesOnLeash[dogeId] == 0, "Shiba Wars: THIS DOGE IS LEASHED ALREADY");
        // leash must not be used
        require(leashUsed[leashId] == 0, "Shiba Wars: THIS LEASH IS USED ALREADY");
        // leash the doge
        dogesOnLeash[dogeId] = leashId;
        leashUsed[leashId] = dogeId;
    }

    function unleashDoge(uint dogeId) public isSeason() myToken(dogeId) {
        // must be my doge
        // doge must be leashed to unleash
        require(isLeashed(dogeId), "Shiba Wars: THIS DOGE IS NOT LEASHED");
        uint leashId = dogesOnLeash[dogeId];
        leashUsed[leashId] = 0;
        dogesOnLeash[dogeId] = 0;
    }

    function isLeashUsed(uint256 leashId) public view returns (bool) {
        return leashUsed[leashId] != 0;
    }

    function isLeashed(uint dogeId) public view returns (bool) {
        return dogesOnLeash[dogeId] != 0;
    }

    function getDoge(uint leashId) public view returns (uint256) {
        return leashUsed[leashId];
    }

    function getLeashId(uint dogeId) public view returns (uint256) {
        uint leashId = dogesOnLeash[dogeId];
        return leashId == 0 ? 0 : shibaWars.getTokenDetails(leashId).id;
    }

    function goOnAdventure(uint dogeId) public myToken(dogeId) {
        // get random enemy
        // get adventure level of this doge
        uint adventureLevel = adventures[dogeId] + 1;
        // get random enemy - akita inu, rottweiler, bear
        uint64 enemy = (uint64)(abi.encodePacked(block.timestamp, block.difficulty, dogeId).random(0, 2));
        uint64 strength = (uint64)(enemy.add(1).mul(300).add(abi.encodePacked(block.timestamp, block.difficulty, enemy).random(0, enemy.add(1).mul(300))).mul(adventureLevel));
        ShibaWarsEntity.Doge memory _doge = shibaWars.getTokenDetails(dogeId);
        // pick random skill of my shiba
        uint damage = enemy == 0 ? _doge.strength : (enemy == 1 ? _doge.agility : _doge.dexterity);
        uint leashId = dogesOnLeash[dogeId];
        uint upgrade = leashId != 0 ? shibaWars.getTokenDetails(leashId).strength.add(100) : 100;
        damage = damage.mul(upgrade).div(100);
        uint8 winner = 0;
        if(damage > adventureLevel.mul(1000).mul(enemy + 1)) {
            // defender fainted
            winner = 1;
        }
        if (winner == 0) {
            // defender attacks as well
            if(strength > _doge.hitPoints - 1) {
                // attacker fainted
                shibaWars.decreaseHp(dogeId, _doge.hitPoints - 1);
            } else {
                shibaWars.decreaseHp(dogeId, strength);
            }
        }
        if(winner == 0 && damage >= strength) {
            // attacker won
            winner = 1;
        }
        uint reward = 0;
        if(winner == 1) {
            uint newScore = _doge.arenaScore.add(adventureLevel.sqrt());
            reward = abi.encodePacked(block.timestamp, block.difficulty, newScore).random(adventureLevel.mul(30000), adventureLevel.mul(60000));
            ++adventures[dogeId];
            shibaWars.addTreats(msg.sender, reward);
            shibaWars.setScore(dogeId, newScore);
        } else {
            adventures[dogeId] = 0;
        }
        emit AdventureFight(dogeId, enemy, damage, strength, reward);
    }

    function getAdventureLevel(uint dogeId) public view returns (uint) {
        return adventures[dogeId];
    }

}