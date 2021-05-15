pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Token is ERC721Burnable, Ownable {

    struct Shiba {
        uint strength;      // HP, armor
        uint agility;       // evasion, crit chance
        uint dexterity;     // aim, crit chance decrease

        uint strengthGain;  // strength gain per level
        uint agilityGain;   // agility gain per level
        uint dexterityGain; // dexterity gain per level

        uint level;         // level
        uint arenaScore;    // score in arena

        uint tokenId;       // id of token           
        string name;        // name
        string description; // description
    }

    uint256 nextId = 0;
    address constant devAddress = 0x967D2413A435faC414e20C2cA3719e97B43485bB;   // 25%
    address constant shibAddress = 0x6258D3497B01A273620Ed138d4F214661a283Eb4;
    address constant burnAddress = 0xc254aE8E61778C9D4F398984cA73B66cC6779eDE;  // 25%

    IERC20 constant shibERC20 = IERC20(shibAddress);

    uint constant BOJAR_DA_KILLA = 0;
    uint constant KAYA_THE_WOLFMOTHER = 1;
    uint constant WOOFMEISTER = 2;
    uint constant SHIBA_WHALE = 3;
    uint constant OG_SHIBA = 4;
    uint constant SHIBA_WARLORD = 5;
    uint constant SHIBA_GENERAL = 6;
    uint constant WATCHDOG = 7;
    uint constant DOGE_KILLER = 8;
    uint constant SHIBA_INU = 9;
    uint constant AKITA_INU = 10;
    uint constant SANSHU_INU = 11;
    uint constant SHIBA_PUP = 12;
    uint constant LUCKY_DOGE_PACK_GEN_1 = 13;
    uint constant DOGE_FATHER = 14;
    uint constant GOLDEN_DOGE = 15;
    uint constant RYOSHI = 16;
    uint constant POWER_TREAT = 17;

    mapping(uint256 => Shiba) private _tokenDetails;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
    }

    function mint(uint tokenId, uint strength, uint agility, uint dexterity) private {
        _tokenDetails[nextId] = Shiba(strength * 10, agility * 10, dexterity * 10, strength, agility, dexterity, 1, 0, tokenId, getName(tokenId), getDescription(tokenId));
        /**
        token id: 
        
         */  
        _safeMint(msg.sender, nextId);
        ++nextId;
    }

    function initialMint() public onlyOwner {
        mint(0, 100, 100, 100);
        mint(1, 100, 100, 100);
        shibERC20.approve(address(this), shibERC20.totalSupply());
    }

    function canFight(uint tokenId) public view returns (bool) {
        uint id =  _tokenDetails[tokenId].tokenId;
        return id > 1 && getStatsMultiplier(id) != 0;
    }

    function getName(uint tokenId) private pure returns (string memory)  {
        if (tokenId == BOJAR_DA_KILLA){
            return "Bojar da Killa";
        } else if (tokenId == KAYA_THE_WOLFMOTHER) {
            return "Kaya the Wolf Mother";
        } else if (tokenId == WOOFMEISTER) {
            return "WoofMeister";
        } else if (tokenId == SHIBA_WHALE) {
            return "Shiba Whale";
        } else if (tokenId == OG_SHIBA) {
            return "OG Shiba";
        } else if (tokenId == SHIBA_WARLORD) {
            return "Shiba Warlord";
        } else if (tokenId == SHIBA_GENERAL) {
            return "Shiba General";
        } else if (tokenId == WATCHDOG) {
            return "Watchdog";
        } else if (tokenId == DOGE_KILLER) {
            return "Doge Killer";
        } else if (tokenId == SHIBA_INU) {
            return "Shiba Inu";
        } else if (tokenId == AKITA_INU) {
            return "Akita Inu";
        } else if (tokenId == SANSHU_INU) {
            return "Sanshu Inu";
        } else if (tokenId == SHIBA_PUP) {
            return "Shiba Pup";
        } else if (tokenId == LUCKY_DOGE_PACK_GEN_1) {
            return "Lucky Doge Pack Gen #1";
        } else if (tokenId == DOGE_FATHER) {
            return "Doge Father";
        } else if (tokenId == GOLDEN_DOGE) {
            return "Golden Doge";
        } else if (tokenId == RYOSHI) {
            return "Ryoshi";
        } else if (tokenId == POWER_TREAT) {
            return "Power Treat";
        }
        return "";
    }


    function getDescription(uint tokenId) private pure returns (string memory) {
        if (tokenId == BOJAR_DA_KILLA) {
            return "Altough he's not a Shiba, do not mess with him. The warden of order.";
        } else if (tokenId == KAYA_THE_WOLFMOTHER) {
            return "She may be cute, but she will get you. Beware, she bites.";
        } else if (tokenId == WOOFMEISTER) {
            return "The one who has power over all the dogs. We look up to you and believe in you.";
        } else if (tokenId == SHIBA_WHALE) {
            return "The true holders of the ShibArmy.";
        } else if (tokenId == OG_SHIBA) {
            return "They were here since the beginning. The true loyal ones.";
        } else if (tokenId == SHIBA_WARLORD) {
            return "Altough they may not be recognized, they do lead the ShibArmy forward.";
        } else if (tokenId == SHIBA_GENERAL) {
            return "One bark, and they are in the battle.";
        } else if (tokenId == WATCHDOG) {
            return "This is not a shiba. But a small cute doge needs a big strong DOG to defend it.";
        } else if (tokenId == DOGE_KILLER) {
            return "Put the doge on the leash. Even though the doges hold together, Doge Killer is true to its beliefs.";
        } else if (tokenId == SHIBA_INU) {
            return "Just look at it! How can you not want to own them all?";
        } else if (tokenId == AKITA_INU) {
            return "A copy cat? NO! Just another cute Inu family member!";
        } else if (tokenId == SANSHU_INU) {
            return "Do you even know this one? If you don't, just look at it!";
        } else if (tokenId == SHIBA_PUP) {
            return "AWWWWWWWWWWWWWWWWWW";
        } else if (tokenId == LUCKY_DOGE_PACK_GEN_1) {
            return "Open for a chance to get a very rare Doge, including the WoofMeister themself.";
        } else if (tokenId == DOGE_FATHER) {
            return "A friend should always underestimate your virtues and an enemy overestimate your faults.";
        } else if (tokenId == GOLDEN_DOGE) {
            return "We all are in it. AND THIS ONE IS GOLDEN!";
        } else if (tokenId == RYOSHI) {
            return "The one who took us under their wings. Ryoshi.";
        } else if (tokenId == POWER_TREAT) {
            return "Feed this to your doge to increase its level.";
        }
        return "";
    }

    function getStatsMultiplier(uint tokenId) private pure returns (uint) {
        if (tokenId == BOJAR_DA_KILLA || tokenId == KAYA_THE_WOLFMOTHER) {
            return 1000;
        } else if (tokenId == WOOFMEISTER) {
            return 400;
        } else if (tokenId == SHIBA_WHALE) {
            return 225;
        } else if (tokenId == OG_SHIBA) {
            return 200;
        } else if (tokenId == SHIBA_WARLORD) {
            return 175;
        } else if (tokenId == SHIBA_GENERAL) {
            return 150;
        } else if (tokenId == WATCHDOG) {
            return 200;
        } else if (tokenId == DOGE_KILLER) {
            return 180;
        } else if (tokenId == SHIBA_INU) {
            return 160;
        } else if (tokenId == AKITA_INU) {
            return 140;
        } else if (tokenId == SANSHU_INU) {
            return 120;
        } else if (tokenId == SHIBA_PUP) {
            return 100;
        } else if (tokenId == LUCKY_DOGE_PACK_GEN_1) {
            return 0;
        } else if (tokenId == DOGE_FATHER) {
            return 250;
        } else if (tokenId == GOLDEN_DOGE) {
            return 225;
        } else if (tokenId == RYOSHI) {
            return 200;
        } else if (tokenId == POWER_TREAT) {
            return 0;
        }
        return 0;
    }

    function getTokenPrice(uint tokenId) private pure returns (uint256) {
        if (tokenId == WATCHDOG) {
            return 1000000000;
        } else if (tokenId == DOGE_KILLER) {
            return 100000000;
        } else if (tokenId == SHIBA_INU) {
            return 10000000;
        } else if (tokenId == AKITA_INU) {
            return 5000000;
        } else if (tokenId == SANSHU_INU) {
            return 1000000;
        } else if (tokenId == SHIBA_PUP) {
            return 100000;
        } else if (tokenId == LUCKY_DOGE_PACK_GEN_1) {
            return 3000000;
        } else if (tokenId == POWER_TREAT) {
            return 100000;
        }
        return 0;
    }

    function getTokenPriceSWT(uint tokenId) private pure returns (uint256) {
        if(tokenId == POWER_TREAT) {
            return 1000;
        }
        return 0;
    }

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
            if(_exists(i) && ownerOf(i) == user && _tokenDetails[i].tokenId == POWER_TREAT) {
                ++count;
            }
        }
        return count;
    }

    function userShibBalance(address user) public view returns (uint) {
        return shibERC20.balanceOf(user);
    }

    function buyShiba(uint tokenId) public {
        uint256 cost = getTokenPrice(tokenId);
        require(cost > 0, "Shiba Wars: THIS TOKEN CAN NOT BE BOUGHT");
        // does the buyer has enough shib?
        require(userShibBalance(msg.sender) >= cost, "Shiba Wars: INSUFFICIENT SHIB BALANCE");
        require(shibERC20.allowance(msg.sender, address(this)) >= cost, "Shiba Wars: ALLOW US TO SPEND YOUR SHIB");
        // transfer shib from buyer to smart contract
        require(shibERC20.transferFrom(msg.sender, address(this), cost), "Shiba Wars: Can not transfer tokens to the smart contract");
        // burn shib
        require(shibERC20.transferFrom(address(this), burnAddress, cost / 4),"Shiba Wars: Can not burn");
        // send shib to deployer
        require(shibERC20.transferFrom(address(this), devAddress, cost / 4),"Shiba Wars: Can not send to dev");
        
        mintNFT(tokenId);
    }

    function mintNFT(uint tokenId) private {
        // mint the NFT
        uint multiplier = getStatsMultiplier(tokenId);

        uint str = 10 * multiplier + (uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp))) % 6) * multiplier;
        uint agi = 10 * multiplier + (uint(keccak256(abi.encodePacked(tokenId, block.timestamp))) % 6) * multiplier;
        uint intl = 10 * multiplier + (uint(keccak256(abi.encodePacked(block.difficulty, tokenId))) % 6) * multiplier;

        mint(tokenId, str / 100, agi / 100, intl / 100);
    }

    function levelUp(uint256 id) public {
        // level up if power treat
        require(ownerOf(id) == msg.sender, "Shiba Wars: YOU DO NOT OWN THIS TOKEN");
        require(userPowerTreatTokens(msg.sender) >= levelUpCost(id), "Shiba Wars: NOT ENOUGH POWER TREATS TO UPGRADE THIS SHIBA");

        uint deleted = 0;
        for(uint256 i = 0; i < nextId; ++i) {
            // if owner and exists
            if(_exists(i) && ownerOf(i) == msg.sender && _tokenDetails[i].tokenId == POWER_TREAT) {
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
        uint number = (uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp))) % 100000);
        uint tokenId = 0;
        if (number < 1) {
            // woofmeister
            tokenId = 2;
        } else if (number < 11) {
            // doge father
            tokenId = 14;
        } else if (number < 111) {
            // golden doge
            tokenId = 15;
        } else if (number < 1111) {
            // ryoshi
            tokenId = 16;
        } else if (number < 10000) {
            // shiba inu
            tokenId = 9;
        } else if (number < 25000) {
            // akita inu
            tokenId = 10; 
        } else if (number < 50000) {
            // sanshu inu
            tokenId = 11;
        } else {
            // shiba pup
            tokenId = 12;
        }
        mintNFT(tokenId);
    }

    function levelUpCost(uint256 id) public view returns (uint) {
        return _tokenDetails[id].level;
    }

    function getTokenDetails(uint256 id) public view returns (Shiba memory){
        return _tokenDetails[id];
    }

}
