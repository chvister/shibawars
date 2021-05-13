pragma solidity 0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC721, Ownable {

    struct Shiba {
        uint strength;      // HP, armor
        uint agility;       // evasion, crit chance
        uint dexterity;     // aim, crit chance decrease

        uint strengthGain;  // strength gain per level
        uint agilityGain;   // agility gain per level
        uint dexterityGain; // dexterity gain per level

        uint level;         // level

        uint tokenId;       // id of token           
        string name;        // name
        string description; // description
    }

    uint256 nextId = 0;

    mapping(uint256 => Shiba) private _tokenDetails;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
    }

    function mint(string memory name, string memory description, uint strength, uint agility, uint dexterity) public onlyOwner {
        _tokenDetails[nextId] = Shiba(strength, agility, dexterity, strength / 10, agility / 10, dexterity / 10, 1, 0, name, description);
        /**
        token id: 
        0: Bojar
        1: Woofmeister
        2: Shiba Whale
        3: OG Shiba
        4: Shiba Warlord
        5: Shiba General
        6: Watchdog
        7: Doge Killer
        8: Shiba Inu
        9: Akita Inu
        10: Sanshu Inu
        11: Shiba Pup
        12: Lucky Doge Pack Gen#1
        13: Doge Father
        14: Golden Doge
        15: Ryoshi
         */  
        _safeMint(msg.sender, nextId);
        ++nextId;
    }

    function levelUp(uint256 id) public {
        ++_tokenDetails[id].level;
        _tokenDetails[id].strength += _tokenDetails[id].strengthGain;
        _tokenDetails[id].agility += _tokenDetails[id].agilityGain;
        _tokenDetails[id].dexterity += _tokenDetails[id].dexterityGain;
    }

    function getTokenDetails(uint256 id) public view returns (Shiba memory){
        return _tokenDetails[id];
    }

}
