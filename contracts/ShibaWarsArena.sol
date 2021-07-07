pragma solidity ^0.8.0;

import "./ShibaWarsEntity.sol";
import "./ShibaMath.sol";
import "./IShibaWars.sol";

contract ShibaWarsArena {

    using ShibaWarsEntity for ShibaWarsEntity.ArenaQueue;
    using ShibaMath for uint;
    using ShibaMath for uint64;
    using ShibaMath for bytes;

    uint256[] private arenaQueue;
    mapping(uint256 => ShibaWarsEntity.ArenaQueue) private _tolerances;

    IShibaWars private shibaWars;

    constructor (address shibaWars_) {
        shibaWars = IShibaWars(shibaWars_);
    }
        
    function queueToArena(uint tokenId, uint tolerance) public {
        ShibaWarsEntity.Shiba memory _shiba = shibaWars.getTokenDetails(tokenId);
        // must be my shiba
        require(shibaWars.ownerOf(tokenId) == msg.sender, "Shiba Wars: YOU DO NOT OWN THIS TOKEN");
        // must be doge
        require(canFight(tokenId), "Shiba Wars: THIS DOGE CAN NOT FIGHT!");
        // can not be in arena
        require(_shiba.inArena == 0, "Shiba Wars: THIS DOGE IS IN ARENA ALREADY");
        require(_shiba.hitPoints > 1, "Shiba Wars: THIS DOGE IS TOO EXHAUSTED");
        shibaWars.putInArena(tokenId);
        (uint256 min_, uint256 max_) = getMinAndMaxScore(_shiba.arenaScore, tolerance);
        bool pushed = false;
        for(uint i = 0; i < arenaQueue.length; ++i){
            if(arenaQueue[i] == 0) {
                arenaQueue[i] = tokenId;
                pushed = true;
                break;
            }
        }
        if(!pushed) {
            arenaQueue.push(tokenId);
        }
        _tolerances[tokenId] = ShibaWarsEntity.ArenaQueue(min_, max_);
    }

    function getMinAndMaxScore(uint256 score, uint256 tolerance) private pure returns (uint256 min_, uint256 max_) {
        uint256 scoreDiff = score.ratio(tolerance, 100);
        min_ = scoreDiff > score - 1 ? 1 : score.sub(scoreDiff) ;
        max_ = score.add(scoreDiff);
    }

    function matchmake(uint tokenId, uint tolerance) public {
         ShibaWarsEntity.Shiba memory _shiba = shibaWars.getTokenDetails(tokenId);
        // must be my shiba
        require(shibaWars.ownerOf(tokenId) == msg.sender, "Shiba Wars: YOU DO NOT OWN THIS TOKEN");
        // must be doge
        require(canFight(tokenId), "Shiba Wars: THIS DOGE CAN NOT FIGHT!");
        // can not be in arena
        require(_shiba.inArena == 0, "Shiba Wars: THIS DOGE IS IN ARENA ALREADY");
        require(_shiba.hitPoints > 1, "Shiba Wars: THIS DOGE IS TOO EXHAUSTED");
        (uint256 min_, uint256 max_) = getMinAndMaxScore(_shiba.arenaScore, tolerance);
        uint256[] memory _arenaQueue = arenaQueue;
        uint256 foundId = 0;
        uint index = 0;
        // find the best match
        for(; index < _arenaQueue.length; ++index) {
            uint256 id = _arenaQueue[index];
            if(id != 0) {
                ShibaWarsEntity.ArenaQueue memory queue = _tolerances[id];
                if(_shiba.arenaScore.inRange(queue.minScore, queue.maxScore)) {
                    ShibaWarsEntity.Shiba memory _otherDoge = shibaWars.getTokenDetails(id);
                    if(_otherDoge.arenaScore.inRange(min_, max_)) {
                        foundId = id;
                        break;
                    }
                }
            }
        }
        require(foundId != 0, "Shiba Wars: NO APPROPRIATE MATCH FOUND");
        // remove from queue
        arenaQueue[index] = 0;
        // remove from mapping
        delete _tolerances[foundId];
        // do the fight
        fight(tokenId, foundId);
    }

    function fight(uint256 firstShiba, uint256 secondShiba) private {
        require(shibaWars.ownerOf(firstShiba) != shibaWars.ownerOf(secondShiba), "Shiba Wars: CAN NOT FIGHT YOUR OWN DOGE");
        ShibaWarsEntity.Shiba memory attacker;
        ShibaWarsEntity.Shiba memory defender;
        {
        ShibaWarsEntity.Shiba memory _first = shibaWars.getTokenDetails(firstShiba);
        ShibaWarsEntity.Shiba memory _second = shibaWars.getTokenDetails(secondShiba);
        // the one with higher agility attacks first
        (attacker, defender) = _first.agility >= _second.agility ? (_first, _second) : (_second, _first);
        }
        uint damageAttacker = 0;
        uint damageDefender = 0;
        uint attackerHp = attacker.hitPoints;
        uint defenderHp = defender.hitPoints;
        // 8 rounds
        uint round = 0;
        while(round < 8 && attackerHp > 1 && defenderHp > 1) {
            // attacker attacks
            if(hit(getAim(attacker.id), getDodge(defender.id), round)) {
                // if hit damage is dealt
                uint damage = getDamage(getMinDamage(attacker.id), getMaxDamage(attacker.id), round);
                bool isCritical = criticalHit(getCritAim(attacker.id), getCritDodge(defender.id), round);
                if (isCritical) {
                    damage = damage.mul(3).div(2);
                }
                uint armor = getArmor(defender.id);
                damage = armor > damage ? 0 : damage.sub(armor);
                damage = damage.min(defenderHp.sub(1));
                defenderHp = defenderHp.sub(damage);
                damageAttacker = damageAttacker.add(damage);
                // if dead -> end
                if(defenderHp == 1) {
                    break;
                }
            }
            // defender attacks
            if(hit(getAim(defender.id), getDodge(attacker.id), round + 8)) {
                // if hit damage is dealt
                uint damage = getDamage(getMinDamage(defender.id), getMaxDamage(defender.id), round + 8);
                bool isCritical = criticalHit(getCritAim(defender.id), getCritDodge(attacker.id), round + 8);
                if (isCritical) {
                    damage = damage.mul(3).div(2);
                }
                uint armor = getArmor(attacker.id);

                damage = armor > damage ? 0 : damage.sub(armor);
                damage = damage.min(attackerHp.sub(1));
                attackerHp = attackerHp.sub(damage);
                damageDefender = damageDefender.add(damage);

                // if dead -> end
                if(attackerHp == 1) {
                    break;
                }
            }
            // next round
            ++round;
        }
        shibaWars.decreaseHp(attacker.id, damageDefender);
        shibaWars.decreaseHp(defender.id, damageAttacker);
        // attacker wins if defender fainted or attacker did more damage
        if(defenderHp == 1 || damageAttacker > damageDefender) {
            uint256 score = scoreReward(attacker.arenaScore, defender.arenaScore);
            shibaWars.addScore(attacker.id, score);
            shibaWars.decreaseScore(defender.id, score);
        } else {
            uint256 score = scoreReward(attacker.arenaScore, defender.arenaScore);
            shibaWars.addScore(defender.id, score);
            shibaWars.decreaseScore(attacker.id, score);
        }
    }

    function scoreReward(uint256 winnerScore, uint256 loserScore) private pure returns (uint256) {
        uint256 multiplier = loserScore.mul(100).div(winnerScore);
        uint256 score = multiplier.mul(25).div(100);
        return score.trim(1, 50);
    }
    
    function getArmor(uint id) public view returns (uint) {
        return shibaWars.getTokenDetails(id).strength;
    }

    function getAim(uint id) public view returns (uint) {
        return shibaWars.getTokenDetails(id).dexterity.add(5);
    }

    function getDodge(uint id) public view returns (uint) {
        return shibaWars.getTokenDetails(id).agility.add(5);
    }

    function getCritAim(uint id) public view returns (uint) {
        return shibaWars.getTokenDetails(id).agility.add(5);
    }

    function getCritDodge(uint id) public view returns (uint) {
        return shibaWars.getTokenDetails(id).dexterity.add(5);
    }

    function getPrimary(uint id)  private view returns (uint) {
        if(shibaWars.getTokenDetails(id).primary == 1) {
            return shibaWars.getTokenDetails(id).strength;    
        } else if(shibaWars.getTokenDetails(id).primary == 2) {
            return shibaWars.getTokenDetails(id).agility;    
        }  else {
            return shibaWars.getTokenDetails(id).dexterity;    
        }
    } 

    function getMinDamage(uint id) public view returns (uint) {
        return getPrimary(id);
    }

    function getMaxDamage(uint id) public view returns (uint) {
        return getPrimary(id).mul(3);
    }

    function getDamage(uint minDamage, uint maxDamage, uint seed) private view returns (uint) {
        return abi.encodePacked(block.difficulty, block.timestamp, seed, minDamage, maxDamage).random(minDamage, maxDamage);
    }

    function hit(uint aim, uint dodge, uint seed) private view returns (bool) {
        (uint aimValue, uint dodgeValue) = (abi.encodePacked(block.difficulty, block.timestamp, aim, seed).random(0, aim),
            abi.encodePacked(block.difficulty, block.timestamp, dodge, seed).random(0, dodge));
        return aimValue > dodgeValue;
    }

    function criticalHit(uint critAim, uint critDodge, uint seed) private view returns (bool) {
        (uint aimValue, uint dodgeValue) = (abi.encodePacked(block.difficulty, block.timestamp, critAim, seed).random(0, critAim),
            abi.encodePacked(block.difficulty, block.timestamp, critDodge, seed).random(0, critDodge * 10));
        return aimValue > dodgeValue;
    }

    // RETURN TRUE IF THIS DOGE CAN FIGHT IN ARENA
    function canFight(uint tokenId) public view returns (bool) {
        uint id =  shibaWars.getTokenDetails(tokenId).tokenId;
        return id > 1 && id != 13;
    }

}