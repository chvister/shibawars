pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IShibaInu.sol";
import "./ShibaWarsUtils.sol";
import "./ShibaWarsEntity.sol";

contract ShibaWars is ERC721Burnable, Ownable {

    using ShibaWarsEntity for ShibaWarsEntity.Shiba;
    using ShibaWarsEntity for ShibaWarsEntity.ATTRIBUTE;

    // info about tokens
    uint256 private nextId = 0;
    mapping(uint256 => ShibaWarsEntity.Shiba) private _tokenDetails;

    // addresses
    address private devAddress;

    IShibaInu constant shibaInu = IShibaInu(0xAC27f67D1D2321FBa609107d41Ff603c43fF6931);
    IERC20 constant sttERC20 = IERC20(0xDFC902011f441F3d59A2BD7f54a25937E5912122);

    uint256 private matchmakerReward;

    constructor() ERC721("ShibaWars", "SHIBW") {
        devAddress = msg.sender;
        matchmakerReward = 0;
    }

    // token creation

    function mint(uint tokenId, uint strength, uint agility, uint dexterity, ShibaWarsEntity.ATTRIBUTE primary) private {
        _tokenDetails[nextId] = 
            ShibaWarsEntity.Shiba(
                nextId,
                strength, 
                agility, 
                dexterity, 
                strength / 10, 
                agility / 10, 
                dexterity / 10, 
                1, 0, tokenId, 
                ShibaWarsUtils.getName(tokenId), 
                ShibaWarsUtils.getDescription(tokenId), 
                getMaxHpFromStrength(strength),
                primary);
        _safeMint(msg.sender, nextId);
        ++nextId;
    }

    function initialMint() public onlyOwner {
        mint(0, 10000, 10000, 10000, ShibaWarsEntity.ATTRIBUTE.STRENGTH);
        mint(1, 10000, 10000, 10000, ShibaWarsEntity.ATTRIBUTE.AGILITY);
    }

    function getPrizePool() public view returns (uint256) {
        return shibaInu.balanceOf(address(this)) - matchmakerReward;
    }

    function getMatchMakerReward() public view returns (uint256) {
        return matchmakerReward;
    }

    function canFight(uint tokenId) public view returns (bool) {
        uint id =  _tokenDetails[tokenId].tokenId;
        return id > 1 && ShibaWarsUtils.getStatsMultiplier(id) != 0;
    }

    function levelUpCost(uint256 id) public view returns (uint) {
        return _tokenDetails[id].level;
    }

    // shiba stats

    function getMaxHp(uint id) public view returns (uint) {
        return getMaxHpFromStrength(_tokenDetails[id].strength);
    }

    function getMaxHpFromStrength(uint strength) private pure returns(uint) {
        return 5000 + strength * 5;
    }

    function getArmor(uint id) public view returns (uint) {
        return _tokenDetails[id].strength;
    }

    function getAim(uint id) public view returns (uint) {
        return _tokenDetails[id].dexterity + 5;
    }

    function getDodge(uint id) public view returns (uint) {
        return _tokenDetails[id].agility + 5;
    }

    function getCritAim(uint id) public view returns (uint) {
        return _tokenDetails[id].agility + 5;
    }

    function getCritDodge(uint id) public view returns (uint) {
        return _tokenDetails[id].dexterity + 5;
    }

    function getPrimary(uint id)  private view returns (uint) {
        if(_tokenDetails[id].primary == ShibaWarsEntity.ATTRIBUTE.STRENGTH) {
            return _tokenDetails[id].strength;    
        } else if(_tokenDetails[id].primary == ShibaWarsEntity.ATTRIBUTE.AGILITY) {
            return _tokenDetails[id].agility;    
        }  else {
            return _tokenDetails[id].dexterity;    
        }
    } 

    function getMinDamage(uint id) public view returns (uint) {
        return getPrimary(id);
    }

    function getMaxDamage(uint id) public view returns (uint) {
        return 3 * getPrimary(id);
    }

    // user info

    function getUserTokens(address user) public view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(user);
        if(tokenCount == 0) {
            return new uint256[](0);
        }
        else {
            uint256[] memory result = new uint256[](tokenCount);
            uint256 index = 0;
            for(uint256 i = 0; i < nextId; ++i) {
                // if owner and exists
                if(_exists(i) && ownerOf(i) == user) {
                    result[index++] = i;
                }
            }
            return result;
        }
    }

    function userPowerTreatTokens(address user) public view returns (uint) {
        uint count = 0;
        for(uint256 i = 0; i < nextId; ++i) {
            // if owner and exists
            if(_exists(i) && ownerOf(i) == user && _tokenDetails[i].tokenId == ShibaWarsUtils.POWER_TREAT) {
                ++count;
            }
        }
        return count;
    }

    function userShibBalance(address user) public view returns (uint) {
        return shibaInu.balanceOf(user) / (10 ** 18);
    }

    function getTokenDetails(uint256 id) public view returns (ShibaWarsEntity.Shiba memory){
        return _tokenDetails[id];
    }

    // buying token

    function buyShiba(uint tokenId) public {
        uint256 cost = ShibaWarsUtils.getTokenPrice(tokenId);
        require(cost > 0, "Shiba Wars: THIS TOKEN CAN NOT BE BOUGHT");
        // does the buyer has enough shib?
        require(shibaInu.balanceOf(msg.sender) >= cost, "Shiba Wars: INSUFFICIENT SHIB BALANCE");
        require(shibaInu.allowance(msg.sender, address(this)) >= cost, "Shiba Wars: ALLOW US TO SPEND YOUR SHIB");
        // transfer shib from buyer to smart contract
        require(shibaInu.transferFrom(msg.sender, address(this), cost), "Shiba Wars: Can not transfer tokens to the smart contract");
        // burn shib
        shibaInu.burn(cost / 4);
        // send shib to deployer
        require(shibaInu.transfer(devAddress, cost / 4),"Shiba Wars: Can not send to dev");
        // 3% to matchmaking
        matchmakerReward += ((cost * 100) - (cost * 97)) / 100;

        mintNFT(tokenId);
    }

    function mintNFT(uint tokenId) private {
        // mint the NFT
        uint multiplier = ShibaWarsUtils.getStatsMultiplier(tokenId);

        uint str = 10 * multiplier + (uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp))) % 6) * multiplier;
        uint agi = 10 * multiplier + (uint(keccak256(abi.encodePacked(tokenId, block.timestamp))) % 6) * multiplier;
        uint intl = 10 * multiplier + (uint(keccak256(abi.encodePacked(block.difficulty, tokenId))) % 6) * multiplier;

        uint primary = uint(keccak256(abi.encodePacked(str, agi, intl, block.timestamp))) % 3;
        ShibaWarsEntity.ATTRIBUTE primaryAttribute = ShibaWarsEntity.ATTRIBUTE.STRENGTH;
        if(primary == 0) {
            primaryAttribute = ShibaWarsEntity.ATTRIBUTE.STRENGTH;
        } else if (primary == 1) {
            primaryAttribute = ShibaWarsEntity.ATTRIBUTE.AGILITY;
        } else if (primary == 2) {
            primaryAttribute = ShibaWarsEntity.ATTRIBUTE.DEXTERITY;
        }

        mint(tokenId, str, agi, intl, primaryAttribute);
    }

    // game functions

    function levelUp(uint256 id) public {
        // level up if power treat
        require(ownerOf(id) == msg.sender, "Shiba Wars: YOU DO NOT OWN THIS TOKEN");
        require(userPowerTreatTokens(msg.sender) >= levelUpCost(id), "Shiba Wars: NOT ENOUGH POWER TREATS TO UPGRADE THIS SHIBA");

        uint deleted = 0;
        for(uint256 i = 0; i < nextId; ++i) {
            // if owner and exists
            if(_exists(i) && ownerOf(i) == msg.sender && _tokenDetails[i].tokenId == ShibaWarsUtils.POWER_TREAT) {
                deleted++;
                burn(i);
                delete _tokenDetails[i];
            }
            if(deleted == levelUpCost(id)) {
                break;
            }
        }

        ++_tokenDetails[id].level;
        _tokenDetails[id].strength += _tokenDetails[id].strengthGain;
        _tokenDetails[id].agility += _tokenDetails[id].agilityGain;
        _tokenDetails[id].dexterity += _tokenDetails[id].dexterityGain;
    }

    function openPack(uint256 id) public {
        // open pack
        // burn the token
        require(ownerOf(id) == msg.sender, "Shiba Wars: YOU DO NOT OWN THIS TOKEN");
        delete _tokenDetails[id];
        burn(id);
        // mint random token
        uint number = (uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp))) % 10000);
        uint tokenId = 0;
        if (number < 1) {
            // woofmeister
            tokenId = ShibaWarsUtils.WOOFMEISTER;
        } else if (number < 11) {
            // doge father
            tokenId = ShibaWarsUtils.DOGE_FATHER;
        } else if (number < 100) {
            // ryoshi
            tokenId = ShibaWarsUtils.RYOSHI;
        } else if (number < 500) {
            // golden doge
            tokenId = ShibaWarsUtils.GOLDEN_DOGE;
        } else if (number < 1500) {
            // shiba inu
            tokenId = ShibaWarsUtils.SHIBA_INU;
        } else if (number < 3000) {
            // akita inu
            tokenId = ShibaWarsUtils.AKITA_INU; 
        } else if (number < 5500) {
            // sanshu inu
            tokenId = ShibaWarsUtils.SANSHU_INU;
        } else {
            // shiba pup
            tokenId = ShibaWarsUtils.SHIBA_PUP;
        }
        mintNFT(tokenId);
    }

    function feed(uint256 id) public {
        // need allowance for treat token
        uint treatTokensNeeded = getMaxHp(id) - _tokenDetails[id].hitPoints;
        require(treatTokensNeeded > 0, "Shiba Wars: This Shiba is not hungry");
        require(sttERC20.balanceOf(msg.sender) >= treatTokensNeeded, "Shiba Wars: Not enough treat tokens to feed this Shiba");
        require(sttERC20.allowance(msg.sender, address(this)) >= treatTokensNeeded, "Shiba Wars: Allow us to spend treat tokens");
        sttERC20.transferFrom(msg.sender, address(this), treatTokensNeeded);
        _tokenDetails[id].hitPoints = getMaxHp(id);
    }

    function fight(uint256 firstShiba, uint256 secondShiba) private {
        // the one with higher agility goes first
        bool firstAttacks = _tokenDetails[firstShiba].agility >= _tokenDetails[secondShiba].agility;
        ShibaWarsEntity.Shiba memory attacker;
        ShibaWarsEntity.Shiba memory defender;
        if (firstAttacks) {
            attacker = _tokenDetails[firstShiba];
            defender = _tokenDetails[secondShiba];
        } else {
            attacker = _tokenDetails[secondShiba];
            defender = _tokenDetails[firstShiba];
        }
        uint damageAttacker = 0;
        uint damageDefender = 0;
        uint attackerHp = _tokenDetails[attacker.id].hitPoints;
        uint defenderHp = _tokenDetails[defender.id].hitPoints;
        // 8 rounds
        uint round = 0;
        while(round < 8 && attackerHp > 1 && defenderHp > 1) {
            // attacker attacks
            if(ShibaWarsUtils.hit(getAim(attacker.id), getDodge(defender.id), round)) {
                // if hit damage is dealt
                uint damage = ShibaWarsUtils.getDamage(getMinDamage(attacker.id), getMaxDamage(attacker.id), round);
                bool isCritical = ShibaWarsUtils.criticalHit(getCritAim(attacker.id), getCritDodge(defender.id), round);
                if (isCritical) {
                    damage *= 3;
                    damage /= 2;
                }
                uint armor = getArmor(defender.id);
                damage -= armor;
                if (damage < 0) {
                    damage = 0;
                } else if (damage >= defenderHp) {
                    damage = defenderHp - 1;
                }
                defenderHp -= damage;
                damageAttacker += damage;
                // if dead -> end
                if(defenderHp == 1) {
                    break;
                }
            }
            // defender attacks
            if(ShibaWarsUtils.hit(getAim(defender.id), getDodge(attacker.id), round + 8)) {
                // if hit damage is dealt
                uint damage = ShibaWarsUtils.getDamage(getMinDamage(defender.id), getMaxDamage(defender.id), round + 8);
                bool isCritical = ShibaWarsUtils.criticalHit(getCritAim(defender.id), getCritDodge(attacker.id), round + 8);
                if (isCritical) {
                    damage *= 3;
                    damage /= 2;
                }
                uint armor = getArmor(attacker.id);
                damage -= armor;
                if (damage < 0) {
                    damage = 0;
                } else if (damage >= attackerHp) {
                    damage = attackerHp - 1;
                }
                attackerHp -= damage;
                damageDefender += damage;
                // if dead -> end
                if(attackerHp == 1) {
                    break;
                }
            }
            // next round
            ++round;
        }
        _tokenDetails[attacker.id].hitPoints -= damageDefender;
        _tokenDetails[defender.id].hitPoints -= damageAttacker;
        // attacker wins if defender fainted or attacker did more damage
        if(defenderHp == 1 || damageAttacker > damageDefender) {
            ++_tokenDetails[attacker.id].arenaScore;
        } else {
            ++_tokenDetails[defender.id].arenaScore;
        }
    }

}
