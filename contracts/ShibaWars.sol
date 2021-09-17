pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./ShibaMath.sol";
import "./ShibaWarsUtils.sol";
import "./ShibaWarsEntity.sol";

contract ShibaWars is ERC721 {

    using ShibaWarsEntity for ShibaWarsEntity.Shiba;

    using ShibaMath for uint64;
    using ShibaMath for uint256;
    using ShibaMath for bytes;
    using Strings for uint256;

    // addresses
    address private devAddress;
    address private shibaWarsArena;
    address private factoryAddress;

    string constant baseURI = "https://ipfs.io/ipfs/QmVMU7GdBnkZg55CedeeVxEehW9v5rbHf391frzoBnYs6q/";
    
    // info about tokens
    uint256 private nextId = 0;
    mapping(uint256 => ShibaWarsEntity.Shiba) private _tokenDetails;
    mapping(address => uint256) private shibaTreats;
    mapping(uint256 => uint256) private breed;
    uint256 private seasonStart;

    uint256 constant SEASON_DURATION = 90 * 24 * 60 * 60;
    uint256 constant MAX_INT = (2 ** 256) - 1;

    modifier isDev(address caller) {
        require(caller == devAddress, "Shiba Wars: Caller is not a dev");
        _;
    }

    modifier isShibaWars(address caller) {
        require(caller == shibaWarsArena || caller == address(this) || caller == factoryAddress,
            "Shiba Wars: Can only be called by Shiba Wars contract!");
        _;
    }

    modifier isSeason() {
        require(block.timestamp >= seasonStart && block.timestamp <= seasonStart + SEASON_DURATION,
            "Shiba Wars: Season ended!");
        _;
    }

    modifier isOwner(uint tokenId, address caller) {
        require(ownerOf(tokenId) == caller, "Shiba Wars: YOU DO NOT OWN THIS TOKEN");
        _;
    }

    constructor() ERC721("ShibaWars", "SHIBW") {
        devAddress = msg.sender;
        seasonStart = block.timestamp;
        mint(msg.sender, ShibaWarsUtils.TEAM_OP_SHIBA, 10000, 10000, 10000, 10000);
        mint(msg.sender, ShibaWarsUtils.TEAM_OP_SHIBA, 10000, 10000, 10000, 10000);
        mint(msg.sender, ShibaWarsUtils.TEAM_OP_SHIBA, 10000, 10000, 10000, 10000);
        factoryAddress = msg.sender; // just so we can mint ryoshi :) will be set to the proper address later
        mintNFT(0xB8f226dDb7bC672E27dffB67e4adAbFa8c0dFA08, 116);
    }

    // MINT NEW TOKEN
    function mint(address owner, uint tokenId, uint strength, uint agility, uint dexterity, uint power) private returns (uint256) {
        _tokenDetails[nextId] = 
            ShibaWarsEntity.Shiba(
                nextId, breed[tokenId],
                (uint64)(strength), 
                (uint64)(agility), 
                (uint64)(dexterity), 
                (uint16)(power), 0,
                (uint32)(tokenId),
                (uint64)(strength.div(10)), 
                (uint64)(agility.div(10)), 
                (uint64)(dexterity.div(10)), 
                1, 1, 249, 
                ShibaWarsUtils.getMaxHp((uint64)(strength)));
        ++breed[tokenId];
        _safeMint(owner, nextId);
        return nextId++;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        ShibaWarsEntity.Shiba memory _shiba = getTokenDetails(tokenId);
        // TODO: CHANGE - _shiba.breed % ShibaWarsUtils.breeds(tokenId);
        return string(abi.encodePacked(baseURI, (uint256)(_shiba.tokenId).toString(), ".json"));
    }

    // SETS ADDRESS OF ARENA CONTRACT. CAN ONLY BE CALLED BY DEV
    function setShibaWarsArena(address shibaWarsArena_) public isDev(msg.sender) {
        shibaWarsArena = shibaWarsArena_;
    }

    // SETS ADDRESS OF ARENA CONTRACT. CAN ONLY BE CALLED BY DEV
    function setFactoryAddress(address factoryAddress_) public isDev(msg.sender) {
        factoryAddress = factoryAddress_;
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

     // TOP 10
    function getWinners() public view returns (uint256[] memory result, uint256[] memory scores) {
        result = new uint256[](10);
        scores = new uint256[](10);
        uint found = 0;
        (uint min, uint max) = (MAX_INT, 0);
        for(uint256 i = 0; i < nextId; ++i) {
            // if owner and exists
            if(_exists(i)) {
                ShibaWarsEntity.Shiba memory shiba = _tokenDetails[i];
                if(ShibaWarsUtils.isShiba(shiba.tokenId)) {
                    bool adding = false;
                    if (found < 10) {
                        adding = true;
                        result[found] = i;
                        scores[found++] = shiba.arenaScore;
                    } else if (shiba.arenaScore > min) {
                        for(uint256 j = 0; j < 10; ++j) {
                            if(scores[j] == min) {
                                result[j] = i;
                                scores[j] = shiba.arenaScore;
                                break;
                            }
                        }
                        adding = true;
                    }
                    if(adding) {
                        if(shiba.arenaScore < min) {
                            min = shiba.arenaScore;
                        }
                        if(shiba.arenaScore > max) {
                            max = shiba.arenaScore;
                        }
                    }
                }
            }
        }
    }

    // DETAILS OF TOKEN
    function getTokenDetails(uint256 id) public view returns (ShibaWarsEntity.Shiba memory){
        return _tokenDetails[id];
    }

    // SETS STATS OF NEW SHIBA AND MINTS
    function mintNFT(address owner, uint tokenId) public isShibaWars(msg.sender) returns (uint256) {
        uint multiplier = ShibaWarsUtils.getStatsMultiplier(tokenId);

        (uint str, uint agi, uint dex) = (tokenId / 100 == 1 && tokenId > ShibaWarsUtils.SHIBAWARS_SUPPORTER) ?
            (abi.encodePacked(block.difficulty, block.timestamp).random(10 * multiplier, 16 * multiplier),
            abi.encodePacked(tokenId, block.timestamp).random(10 * multiplier, 16 * multiplier),
            abi.encodePacked(block.difficulty, tokenId).random(10 * multiplier, 16 * multiplier)) :
            (multiplier, multiplier, multiplier);

        uint power = multiplier == 0 ? 0 : str.add(agi).add(dex).percent(48 * multiplier);

        return mint(owner, tokenId, str, agi, dex, power);
    }

    // LEVEL UP SHIBA
    function levelUp(uint256 id) public isSeason() {
        ShibaWarsEntity.Shiba memory _shiba = _tokenDetails[id];
        // level up if enough shiba treats
        require(shibaTreats[msg.sender] >= ShibaWarsUtils.levelUpCost(_shiba.level), "Shiba Wars: NOT ENOUGH POWER TREATS TO UPGRADE THIS SHIBA");
        // only can level up shibas
        require(ShibaWarsUtils.isShiba(_shiba.tokenId), "Shiba Wars: ONLY SHIBAS CAN BE LEVELLED UP");
        shibaTreats[msg.sender] = shibaTreats[msg.sender].sub(ShibaWarsUtils.levelUpCost(_shiba.level));
        ++_tokenDetails[id].level;
        _tokenDetails[id].strength += _shiba.strengthGain;
        _tokenDetails[id].hitPoints = ShibaWarsUtils.getMaxHp(_shiba.strength + _shiba.strengthGain);
        _tokenDetails[id].agility += _shiba.agilityGain;
        _tokenDetails[id].dexterity += _shiba.dexterityGain;
    }

    function recycle(uint256 id, address caller) public isShibaWars(msg.sender) isOwner(id, caller) {
        _burn(id);
        delete _tokenDetails[id];
    }

    function setInArena(uint256 id, uint16 inArena) public isShibaWars(msg.sender) {
        _tokenDetails[id].inArena = inArena;
    }

    // DECREASES HP 
    function decreaseHp(uint256 id, uint damage) public isShibaWars(msg.sender) {
        _tokenDetails[id].hitPoints = _tokenDetails[id].hitPoints.sub(damage);
    }

    // SET SCORE FOR SHIBA
    function setScore(uint256 id, uint128 score) public isShibaWars(msg.sender) {
        _tokenDetails[id].arenaScore = score;
    }

    // SET MAX SCORE
    function setMaxScore(uint256 id, uint128 score) public isShibaWars(msg.sender) {
        _tokenDetails[id].maxScore = score;
    }

    // FEED YOUR SHIBA
    function feed(uint256 id) public isSeason() {
        ShibaWarsEntity.Shiba memory shiba = _tokenDetails[id];
        uint treatTokensNeeded = ShibaWarsUtils.getMaxHp(shiba.strength).sub(shiba.hitPoints);
        uint256 userTreats = shibaTreats[msg.sender];
        require(treatTokensNeeded > 0, "Shiba Wars: This Shiba is not hungry");
        require(userTreats >= treatTokensNeeded, "Shiba Wars: Not enough treat tokens to feed this Shiba");
        shibaTreats[msg.sender] = userTreats.sub(treatTokensNeeded);
        _tokenDetails[id].hitPoints = ShibaWarsUtils.getMaxHp(shiba.strength);
    }

    function addTreats(address user, uint256 count) public isShibaWars(msg.sender) {
        shibaTreats[user] = shibaTreats[user].add(count);
    }

    function getUserTreatTokens(address user) public view returns (uint) {
        return shibaTreats[user];
    }

    function startSeason() public isDev(msg.sender) {
        seasonStart = block.timestamp;
    }

    function getSeasonStart() public view returns (uint256) {
        return seasonStart;
    }

}
