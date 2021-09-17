pragma solidity ^0.8.0;

import "./ShibaWarsEntity.sol";
import "./ShibaWarsUtils.sol";
import "./ShibaMath.sol";
import "./IShibaWars.sol";

contract ShibaWarsArena {

    using ShibaMath for uint;
    using ShibaMath for uint64;
    using ShibaMath for uint128;
    using ShibaMath for bytes;

    mapping (uint256 => uint256) private arenaQueue;

    // leash to shiba mapping
    mapping(uint256 => uint256) private leashedShibas;
    mapping(uint256 => uint256) private leashUsed;
    mapping(uint256 => uint256) private adventures;

    uint256 private matches = 0;
    mapping(address => uint256) private matchesWon;

    IShibaWars private shibaWars;

    uint256 constant SEASON_DURATION = 90 * 24 * 60 * 60;

    event AdventureFight(uint shibaId, uint enemyId, uint shibaStrength, uint enemyStrength, uint reward);
    event ArenaFight(uint attackerId, uint defenderId, uint attackerDamage, uint defenderDamage, uint outcome);

    modifier isSeason() {
        require(block.timestamp >= shibaWars.getSeasonStart() && block.timestamp <= shibaWars.getSeasonStart() + SEASON_DURATION,
            "Shiba Wars: Can only be called by Shiba Wars contract!");
        _;
    }

    modifier myToken(uint tokenId) {
        require(shibaWars.ownerOf(tokenId) == msg.sender, "Shiba Wars: YOU DO NOT OWN THIS TOKEN");
        _;
    }

    modifier hasOpponent(uint tokenId) {
        {
        ShibaWarsEntity.Shiba memory _shiba = shibaWars.getTokenDetails(tokenId);
        uint league = getLeagueFromScore(_shiba.arenaScore);
        require(arenaQueue[league] == 0 || 
            shibaWars.ownerOf(tokenId) != shibaWars.ownerOf(arenaQueue[league]), "Shiba Wars: NO OPPONENT READY FOR THIS SHIBA");
        }
        _;
    }

    modifier canFight(uint tokenId) {
        {
        ShibaWarsEntity.Shiba memory _shiba = shibaWars.getTokenDetails(tokenId);
        uint id = _shiba.tokenId;
        // must be shiba
        require(id / 100 == 1 && id > ShibaWarsUtils.TEAM_OP_SHIBA, "Shiba Wars: THIS SHIBA CAN NOT FIGHT!");
        // can not be in arena
        require(_shiba.inArena == 0, "Shiba Wars: THIS SHIBA IS IN ARENA ALREADY");
        require(_shiba.hitPoints > 1, "Shiba Wars: THIS SHIBA IS TOO EXHAUSTED");
        }
        _;
    }
 
    constructor (address shibaWars_) {
        shibaWars = IShibaWars(shibaWars_);
    }

    function queueToArena(uint tokenId) public isSeason() hasOpponent(tokenId) myToken(tokenId) canFight(tokenId) {
        ShibaWarsEntity.Shiba memory _shiba = shibaWars.getTokenDetails(tokenId);
        uint league = getLeagueFromScore(_shiba.arenaScore);
        uint enemyId = arenaQueue[league];
        if(enemyId == 0) {
            shibaWars.setInArena(tokenId, 1);
            arenaQueue[league] = tokenId;
        } else {
            fight(tokenId, enemyId);
            shibaWars.setInArena(enemyId, 0);
            arenaQueue[league] = 0;
        }
    }

    function fight(uint256 firstShiba, uint256 secondShiba) private isSeason() {
        require(shibaWars.ownerOf(firstShiba) != shibaWars.ownerOf(secondShiba), "Shiba Wars: CAN NOT FIGHT YOUR OWN SHIBA");
        ShibaWarsEntity.Shiba memory attacker;
        ShibaWarsEntity.Shiba memory defender;
        {
            ShibaWarsEntity.Shiba memory _first = shibaWars.getTokenDetails(firstShiba);
            ShibaWarsEntity.Shiba memory _second = shibaWars.getTokenDetails(secondShiba);
            // the one with higher agility attacks first
            (attacker, defender) = _first.agility >= _second.agility ? (_first, _second) : (_second, _first);
        }
        (uint damageAttacker, uint damageDefender, uint128 winner) = (0, 0, 0);
        {
            (uint attackerUpgrade, uint defenderUpgrade) = (100, 100);
            {
                (uint attackerLeash, uint defenderLeash) = (leashedShibas[attacker.id], leashedShibas[defender.id]);
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
            // pick random skill for attacker
            uint128 skill = (uint128)(abi.encodePacked(block.timestamp, block.difficulty, firstShiba).random(0, 2));
            damageAttacker = skill == 0 ? attacker.strength : (skill == 1 ? attacker.agility : attacker.dexterity);
            damageAttacker = damageAttacker.mul(attackerUpgrade).div(100);
            skill = (uint128)(abi.encodePacked(block.timestamp, block.difficulty, secondShiba).random(0, 2));
            damageDefender = skill == 0 ? defender.strength : (skill == 1 ? defender.agility : defender.dexterity);
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
        }
        // set max score
        uint newMaxAttacker = maxPointsForLeague(getLeagueFromScore(attacker.arenaScore) + 1);
        uint newMaxDefender = maxPointsForLeague(getLeagueFromScore(defender.arenaScore) + 1);
        if (attacker.maxScore < newMaxAttacker) {
            shibaWars.setMaxScore(attacker.id, (uint128)(newMaxAttacker));
        }
        if (defender.maxScore < newMaxDefender) {
            shibaWars.setMaxScore(defender.id, (uint128)(newMaxDefender));
        }
        ++matches;
        if(winner == 1) {
            uint256 score = scoreReward(attacker.arenaScore, defender.arenaScore);
            uint attNewScore = attacker.arenaScore.add(score);
            uint defNewScore = score <= defender.arenaScore - 1 ? defender.arenaScore.sub(score) : 1;
            matchesWon[shibaWars.ownerOf(attacker.id)] = matchesWon[shibaWars.ownerOf(attacker.id)].add(10);
            setScore(attacker.id, attNewScore, defender.id, defNewScore);
        } else if (winner == 2) {
            uint256 score = scoreReward(defender.arenaScore, attacker.arenaScore);
            uint defNewScore = defender.arenaScore.add(score);
            uint attNewScore = score <= attacker.arenaScore - 1 ? attacker.arenaScore.sub(score) : 1;
            matchesWon[shibaWars.ownerOf(defender.id)] = matchesWon[shibaWars.ownerOf(defender.id)].add(10);
            setScore(attacker.id, attNewScore, defender.id, defNewScore);
        } else {
            // who has more points or attacker should win
            uint256 attackerId = attacker.id;
            uint256 defenderId = defender.id;
            uint256 _exWinner = defender.arenaScore > attacker.arenaScore ? defenderId : attackerId;
            (uint256 scoreA, uint256 scoreB) = 
                (scoreReward(attacker.arenaScore, defender.arenaScore), scoreReward(defender.arenaScore, attacker.arenaScore));
            uint256 score = (scoreA > scoreB ? scoreA.sub(scoreB) : scoreB.sub(scoreA)).trim(1, 50);
            uint attNewScore = _exWinner == attackerId ? attacker.arenaScore.add(score) : attacker.arenaScore.sub(score);
            uint defNewScore = _exWinner == defenderId ? defender.arenaScore.add(score) : defender.arenaScore.sub(score);
            matchesWon[shibaWars.ownerOf(defenderId)] = matchesWon[shibaWars.ownerOf(defenderId)].add(5);
            matchesWon[shibaWars.ownerOf(attackerId)] = matchesWon[shibaWars.ownerOf(attackerId)].add(5);
            setScore(attackerId, attNewScore, defenderId, defNewScore);
        }
        emit ArenaFight(attacker.id, defender.id, damageAttacker, damageDefender, winner);
    }

    function getMatchesWon(address account) public view returns (uint256 _matchesWon, uint256 _totalMatches) {
        _matchesWon = matchesWon[account];
        _totalMatches = matches;
    }

    function scoreReward(uint256 winnerScore, uint256 loserScore) private pure returns (uint256) {
        uint256 multiplier = loserScore.mul(100).div(winnerScore);
        uint256 score = multiplier.mul(25).div(100);
        return score.trim(1, 50);
    }

    function setScore(uint256 attackerId, uint256 attackerScore, uint256 defenderId, uint256 defenderScore) private {
        shibaWars.setScore(attackerId, (uint128)(attackerScore));
        shibaWars.setScore(defenderId, (uint128)(defenderScore));
    }

    function putShibaOnLeash(uint shibaId, uint leashId) public isSeason() myToken(shibaId) myToken(leashId) {
        // shiba id must be shiba
        require(ShibaWarsUtils.isShiba(shibaWars.getTokenDetails(shibaId).tokenId), "Shiba Wars: CAN ONLY LEASH A SHIBA");
        // lesah id must be leash
        require(ShibaWarsUtils.isLeash(shibaWars.getTokenDetails(leashId).tokenId), "Shiba Wars: CAN ONLY LEASH WITH A LEASH");
        // shiba must not be leashed
        require(leashedShibas[shibaId] == 0, "Shiba Wars: THIS SHIBA IS LEASHED ALREADY");
        // leash must not be used
        require(leashUsed[leashId] == 0, "Shiba Wars: THIS LEASH IS USED ALREADY");
        // leash the shiba
        leashedShibas[shibaId] = leashId;
        leashUsed[leashId] = shibaId;
    }

    function unleashShiba(uint shibaId) public isSeason() myToken(shibaId) {
        // must be my shiba
        // shiba must be leashed to unleash
        require(isLeashed(shibaId), "Shiba Wars: THIS SHIBA IS NOT LEASHED");
        uint leashId = leashedShibas[shibaId];
        leashUsed[leashId] = 0;
        leashedShibas[shibaId] = 0;
    }

    function isLeashUsed(uint256 leashId) public view returns (bool) {
        return leashUsed[leashId] != 0;
    }

    function isLeashed(uint shibaId) public view returns (bool) {
        return leashedShibas[shibaId] != 0;
    }

    function getShiba(uint leashId) public view returns (uint256) {
        return leashUsed[leashId];
    }

    function getLeashId(uint shibaId) public view returns (uint256) {
        return leashedShibas[shibaId];
    }

    function goOnAdventure(uint shibaId) public myToken(shibaId) canFight(shibaId) {
        // get random enemy
        // get adventure level of this shiba
        uint adventureLevel = adventures[shibaId] + 1;
        // get random enemy - wild shiba, wolf, bear
        uint64 enemy = (uint64)(abi.encodePacked(block.timestamp, block.difficulty, shibaId).random(0, 2));
        uint64 strength = (uint64)(abi.encodePacked(block.timestamp, block.difficulty, enemy).random(enemy.add(1).mul(300), enemy.add(1).mul(600)).mul(adventureLevel));
        ShibaWarsEntity.Shiba memory _shiba = shibaWars.getTokenDetails(shibaId);
        // pick random skill of my shiba
        uint damage = enemy == 0 ? _shiba.strength : (enemy == 1 ? _shiba.agility : _shiba.dexterity);
        uint leashId = leashedShibas[shibaId];
        uint upgrade = leashId != 0 ? shibaWars.getTokenDetails(leashId).strength.add(100) : 100;
        damage = damage.mul(upgrade).div(100);
        uint8 winner = 0;
        if(damage > adventureLevel.mul(1000).mul(enemy + 1)) {
            // defender fainted
            winner = 1;
        }
        if (winner == 0) {
            // defender attacks as well
            if(strength > _shiba.hitPoints - 1) {
                // attacker fainted
                shibaWars.decreaseHp(shibaId, _shiba.hitPoints - 1);
            } else {
                shibaWars.decreaseHp(shibaId, strength);
            }
        }
        if(winner == 0 && damage >= strength) {
            // attacker won
            winner = 1;
        }
        uint reward = 0;
        if (winner == 1) {
            uint newScore = _shiba.arenaScore.add(adventureLevel.sqrt());
            reward = abi.encodePacked(block.timestamp, block.difficulty, newScore).random(adventureLevel.mul(30000), adventureLevel.mul(60000));
            ++adventures[shibaId];
            shibaWars.addTreats(msg.sender, reward);
            // dont get points if not fought in arena
            if (newScore <= _shiba.maxScore) {
                shibaWars.setScore(shibaId, (uint128)(newScore));
            } else if (_shiba.arenaScore != _shiba.maxScore) {
                shibaWars.setScore(shibaId, _shiba.maxScore);
            }
        } else {
            adventures[shibaId] = 0;
        }
        emit AdventureFight(shibaId, enemy, damage, strength, reward);
    }

    function getAdventureLevel(uint shibaId) public view returns (uint) {
        return adventures[shibaId];
    }

    function getLeagueFromScore(uint score) public pure returns (uint) {
        return score.div(250).sqrt();
    }

    function maxPointsForLeague(uint league) public pure returns (uint) {
        return ((league.add(1)) ** 2).mul(250).sub(1);
    }

}