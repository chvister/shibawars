pragma solidity 0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC721, Ownable {

    struct Shiba {
        uint strength;      // HP, armor
        uint agility;       // evasion, crit chance
        uint dexterity;     // aim, crit chance decrease

        uint level;         // level

        string name;        // name
        string description; // description
    }

    uint256 nextId = 0;

    mapping(uint256 => Shiba) private _tokenDetails;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
    }

    function mint(string memory name, string memory description, uint strength, uint agility, uint dexterity) public onlyOwner {
        _tokenDetails[nextId] = Shiba(strength, agility, dexterity, 1, name, description);  
        _safeMint(msg.sender, nextId);
        ++nextId;
    }

    function upgrade(uint256 id) public {
        ++_tokenDetails[id].level;
    }

    function getTokenDetails(uint256 id) public view returns (Shiba memory){
        return _tokenDetails[id];
    }

}
