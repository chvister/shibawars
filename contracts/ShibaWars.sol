pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./ShibaMath.sol";
import "./ShibaWarsUtils.sol";
import "./ShibaWarsEntity.sol";
import "./IShibaTreatToken.sol";

contract ShibaWars is ERC721 {

    using ShibaWarsEntity for ShibaWarsEntity.Shiba;
    using ShibaWarsEntity for ShibaWarsEntity.ATTRIBUTE;

    using ShibaMath for uint;
    using ShibaMath for bytes;

    // info about tokens
    uint256 private nextId = 0;
    mapping(uint256 => ShibaWarsEntity.Shiba) private _tokenDetails;

    // addresses
    address private devAddress;
    address private shibaWarsArena;
    address private factoryAddress;

    IShibaTreatToken constant shibaTreatToken = IShibaTreatToken(0xDFC902011f441F3d59A2BD7f54a25937E5912122);

    modifier isDev(address caller) {
        require(caller == devAddress, "Shiba Wars: Caller is not a dev");
        _;
    }

    modifier isShibaWars(address caller) {
        require(caller == shibaWarsArena || caller == address(this) || caller == factoryAddress,
            "Shiba Wars: Can only be called by Shiba Wars contract!");
        _;
    }

    constructor() ERC721("ShibaWars", "SHIBW") {
        devAddress = msg.sender;
    }

    // MINT NEW TOKEN
    function _mint(address owner, uint tokenId, uint strength, uint agility, uint dexterity, ShibaWarsEntity.ATTRIBUTE primary) private {
        _tokenDetails[nextId] = 
            ShibaWarsEntity.Shiba(
                nextId,
                strength, 
                agility, 
                dexterity, 
                strength.div(10), 
                agility.div(10), 
                dexterity.div(10), 
                1, 0, tokenId, 
                ShibaWarsUtils.getName(tokenId), 
                ShibaWarsUtils.getDescription(tokenId), 
                getMaxHpFromStrength(strength),
                false,
                primary);
        _safeMint(owner, nextId);
        ++nextId;
    }

    function mint(address owner, uint tokenId, uint strength, uint agility, uint dexterity, ShibaWarsEntity.ATTRIBUTE primary) public isShibaWars(msg.sender) {
        _mint(owner, tokenId, strength, agility, dexterity, primary);
    }

    // MINTS FIRST TWO TOKENS. CAN ONLY BE CALLED BY DEV BUT THESE DOGES CAN NOT FIGHT IN ARENA
    function initialMint() public isDev(msg.sender) {
        _mint(msg.sender, 0, 10000, 10000, 10000, ShibaWarsEntity.ATTRIBUTE.STRENGTH);
        _mint(msg.sender, 1, 10000, 10000, 10000, ShibaWarsEntity.ATTRIBUTE.AGILITY);
    }

    // SETS ADDRESS OF ARENA CONTRACT. CAN ONLY BE CALLED BY DEV
    function setShibaWarsArena(address shibaWarsArena_) public isDev(msg.sender) {
        shibaWarsArena = shibaWarsArena_;
    }

    // SETS ADDRESS OF ARENA CONTRACT. CAN ONLY BE CALLED BY DEV
    function setFactoryAddress(address factoryAddress_) public isDev(msg.sender) {
        factoryAddress = factoryAddress_;
    }

    // RETURN TRUE IF THIS DOGE CAN FIGHT IN ARENA
    function canFight(uint tokenId) public view returns (bool) {
        uint id =  _tokenDetails[tokenId].tokenId;
        return id > 1 && ShibaWarsUtils.getStatsMultiplier(id) != 0;
    }

    // COST OF LEVEL UP IN POWER TREATS
    function levelUpCost(uint256 id) public view returns (uint) {
        return _tokenDetails[id].level;
    }

    // MAX HP OF DOGE
    function getMaxHp(uint id) public view returns (uint) {
        return getMaxHpFromStrength(_tokenDetails[id].strength);
    }

    // MAX HP FROM STRENGTH
    function getMaxHpFromStrength(uint strength) private pure returns(uint) {
        return strength.mul(5).add(5000);
    }

    // USER'S TOKENS
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

    // NUMBER OF USER'S POWER TREAT TOKENS
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

    // DETAILS OF TOKEN
    function getTokenDetails(uint256 id) public view returns (ShibaWarsEntity.Shiba memory){
        return _tokenDetails[id];
    }

    // SETS STATS OF NEW DOGE AND MINTS
    function mintNFT(address owner, uint tokenId) public isShibaWars(msg.sender) {
        uint multiplier = ShibaWarsUtils.getStatsMultiplier(tokenId);

        uint str = multiplier.mul(10).add(abi.encodePacked(block.difficulty, block.timestamp).random(0, 6).mul(multiplier));
        uint agi = multiplier.mul(10).add(abi.encodePacked(tokenId, block.timestamp).random(0, 6).mul(multiplier));
        uint intl = multiplier.mul(10).add(abi.encodePacked(block.difficulty, tokenId).random(0, 6).mul(multiplier));

        uint primary = abi.encodePacked(str, agi, intl, block.timestamp).random(0, 3);
        ShibaWarsEntity.ATTRIBUTE primaryAttribute = ShibaWarsEntity.ATTRIBUTE.STRENGTH;
        if(primary == 0) {
            primaryAttribute = ShibaWarsEntity.ATTRIBUTE.STRENGTH;
        } else if (primary == 1) {
            primaryAttribute = ShibaWarsEntity.ATTRIBUTE.AGILITY;
        } else if (primary == 2) {
            primaryAttribute = ShibaWarsEntity.ATTRIBUTE.DEXTERITY;
        }

        mint(owner, tokenId, str, agi, intl, primaryAttribute);
    }

    // LEVEL UP SHIBA
    function levelUp(uint256 id) public {
        // level up if power treat
        require(ownerOf(id) == msg.sender, "Shiba Wars: YOU DO NOT OWN THIS TOKEN");
        require(userPowerTreatTokens(msg.sender) >= levelUpCost(id), "Shiba Wars: NOT ENOUGH POWER TREATS TO UPGRADE THIS SHIBA");

        uint deleted = 0;
        for(uint256 i = 0; i < nextId; ++i) {
            // if owner and exists
            if(_exists(i) && ownerOf(i) == msg.sender && _tokenDetails[i].tokenId == ShibaWarsUtils.POWER_TREAT) {
                ++deleted;
                _burn(i);
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

    // OPEN LUCKY DOGE PACK
    function openPack(uint256 id, address caller) public isShibaWars(msg.sender) {
        // open pack
        // burn the token
        require(ownerOf(id) == caller, "Shiba Wars: YOU DO NOT OWN THIS TOKEN");
        _burn(id);
        delete _tokenDetails[id];
    }

    // PUTS DOGE IN ARENA
    function putInArena(uint256 id) public isShibaWars(msg.sender) {
        _tokenDetails[id].inArena = true;
    }

    // DECREASES HP 
    function decreaseHp(uint256 id, uint damage) public isShibaWars(msg.sender) {
        uint newHp = _tokenDetails[id].hitPoints.sub(damage); 
        _tokenDetails[id].hitPoints = newHp;
    }

    // ADD SCORE FOR DOGE
    function addSCore(uint256 id, uint score) public isShibaWars(msg.sender) {
        uint newScore = _tokenDetails[id].arenaScore.add(score);
        _tokenDetails[id].arenaScore = newScore;
    }

    // FEED YOUR SHIBA
    function feed(uint256 id) public {
        // need allowance for treat token
        uint treatTokensNeeded = getMaxHp(id).sub(_tokenDetails[id].hitPoints);
        require(treatTokensNeeded > 0, "Shiba Wars: This Shiba is not hungry");
        require(shibaTreatToken.balanceOf(msg.sender) >= treatTokensNeeded, "Shiba Wars: Not enough treat tokens to feed this Shiba");
        require(shibaTreatToken.allowance(msg.sender, address(this)) >= treatTokensNeeded, "Shiba Wars: Allow us to spend treat tokens");
        shibaTreatToken.transferFrom(msg.sender, address(this), treatTokensNeeded);
        _tokenDetails[id].hitPoints = getMaxHp(id);
    }

}
