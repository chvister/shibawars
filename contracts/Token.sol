pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Token is ERC721, Ownable {

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

    mapping(uint256 => Shiba) private _tokenDetails;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
    }

    function mint(uint tokenId, uint strength, uint agility, uint dexterity) public onlyOwner {
        _tokenDetails[nextId] = Shiba(strength * 10, agility * 10, dexterity * 10, strength, agility, dexterity, 1, 0, tokenId, getName(tokenId), getDescription(tokenId));
        /**
        token id: 
        0: Bojar da Killa
        1: Kaya the Wolfmother
        2: Woofmeister
        3: Shiba Whale
        4: OG Shiba
        5: Shiba Warlord
        6: Shiba General
        7: Watchdog
        8: Doge Killer
        9: Shiba Inu
        10: Akita Inu
        11: Sanshu Inu
        12: Shiba Pup
        13: Lucky Doge Pack Gen#1
        14: Doge Father
        15: Golden Doge
        16: Ryoshi
        17: Power Treat
         */  
        _safeMint(msg.sender, nextId);
        ++nextId;
    }

    function canFight(uint tokenId) public view returns (bool) {
        uint id =  _tokenDetails[tokenId].tokenId;
        return id > 1 && getStatsMultiplier(id) != 0;
    }

    function getName(uint tokenId) private pure returns (string memory)  {
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
        } else if (tokenId == 17) {
            return "Power Treat";
        }
        return "";
    }


    function getDescription(uint tokenId) private pure returns (string memory) {
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
        } else if (tokenId == 17) {
            return "Feed this to your doge to increase its level.";
        }
        return "";
    }

    function getStatsMultiplier(uint tokenId) private pure returns (uint) {
        if (tokenId == 0 || tokenId == 1) {
            return 1000;
        } else if (tokenId == 2) {
            return 400;
        } else if (tokenId == 3) {
            return 225;
        } else if (tokenId == 4) {
            return 200;
        } else if (tokenId == 5) {
            return 175;
        } else if (tokenId == 6) {
            return 150;
        } else if (tokenId == 7) {
            return 200;
        } else if (tokenId == 8) {
            return 180;
        } else if (tokenId == 9) {
            return 160;
        } else if (tokenId == 10) {
            return 140;
        } else if (tokenId == 11) {
            return 120;
        } else if (tokenId == 12) {
            return 100;
        } else if (tokenId == 13) {
            return 0;
        } else if (tokenId == 14) {
            return 250;
        } else if (tokenId == 15) {
            return 225;
        } else if (tokenId == 16) {
            return 200;
        } else if (tokenId == 17) {
            return 0;
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
                // if owner and not treat
                if(ownerOf(i) == user) {
                    result[index++] = i;
                }
            }
            return result;
        }
    }

    function userShibBalance(address user) public view returns (uint) {
        return shibERC20.balanceOf(user);
    }

    function buyShiba() public {
        uint256 cost = 100000000;
        // does the buyer has enough shib?
        require(userShibBalance(msg.sender) >= cost, "Shiba Wars: INSUFFICIENT SHIB BALANCE");
        require(shibERC20.allowance(msg.sender, address(this)) >= cost, "Shiba Wars: ALLOW US TO SPEND YOUR SHIB");
        // transfer shib from buyer to smart contract
        require(shibERC20.transferFrom(msg.sender, address(this), cost));
        // burn shib
        shibERC20.transferFrom(address(this), burnAddress, cost / 4);
        // send shib to deployer
        shibERC20.transferFrom(address(this), devAddress, cost / 4);
        // mint the NFT
        uint id = uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, nextId))) % 18;
        uint multiplier = getStatsMultiplier(id);

        uint str = 10 * multiplier + (uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp))) % 6) * multiplier;
        uint agi = 10 * multiplier + (uint(keccak256(abi.encodePacked(id, block.timestamp))) % 6) * multiplier;
        uint intl = 10 * multiplier + (uint(keccak256(abi.encodePacked(block.difficulty, id))) % 6) * multiplier;

        mint(id, str / 100, agi / 100, intl / 100);
    }

    function levelUp(uint256 id) public {
        // level up if power treat
        ++_tokenDetails[id].level;
        _tokenDetails[id].strength += _tokenDetails[id].strengthGain;
        _tokenDetails[id].agility += _tokenDetails[id].agilityGain;
        _tokenDetails[id].dexterity += _tokenDetails[id].dexterityGain;
    }

    function getTokenDetails(uint256 id) public view returns (Shiba memory){
        return _tokenDetails[id];
    }

}
