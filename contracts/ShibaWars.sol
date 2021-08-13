pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./ShibaMath.sol";
import "./ShibaWarsUtils.sol";
import "./ShibaWarsEntity.sol";

contract ShibaWars is ERC721 {

    using ShibaWarsEntity for ShibaWarsEntity.Doge;

    using ShibaMath for uint64;
    using ShibaMath for uint256;
    using ShibaMath for bytes;
    using Strings for uint256;

    // addresses
    address private devAddress;
    address private shibaWarsArena;
    address private factoryAddress;

    string constant baseURI = "https://ipfs.io/ipfs/Qmf4ngHHgzmuRCYXCpVytwr9UsqPonLPK2urmy8faGo1Bu/token_metadata/";
    
    // info about tokens
    uint256 private nextId = 1;
    mapping(uint256 => ShibaWarsEntity.Doge) private _tokenDetails;
    mapping(address => uint256) private shibaTreats;
    uint256 public seasonStart;

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
        mint(msg.sender, 0, 10000, 10000, 10000);
        mint(msg.sender, 1, 10000, 10000, 10000);
    }

    // MINT NEW TOKEN
    function mint(address owner, uint tokenId, uint strength, uint agility, uint dexterity) private {
        _tokenDetails[nextId] = 
            ShibaWarsEntity.Doge(
                nextId,
                (uint64)(strength), 
                (uint64)(agility), 
                (uint64)(dexterity), 
                (uint32)(tokenId),
                0,
                (uint64)(strength.div(10)), 
                (uint64)(agility.div(10)), 
                (uint64)(dexterity.div(10)), 
                1, 1, 
                ShibaWarsUtils.getMaxHp((uint64)(strength)));
        _safeMint(owner, nextId);
        ++nextId;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        ShibaWarsEntity.Doge memory _doge = getTokenDetails(tokenId);
        return string(abi.encodePacked(baseURI, (uint256)(_doge.tokenId).toString(), ".json"));
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
                ShibaWarsEntity.Doge memory doge = _tokenDetails[i];
                if(ShibaWarsUtils.isDoge(doge.tokenId)) {
                    bool adding = false;
                    if (found < 10) {
                        adding = true;
                        result[found] = i;
                        scores[found++] = doge.arenaScore;
                    } else if (doge.arenaScore > min) {
                        for(uint256 j = 0; j < 10; ++j) {
                            if(scores[j] == min) {
                                result[j] = i;
                                scores[j] = doge.arenaScore;
                                break;
                            }
                        }
                        adding = true;
                    }
                    if(adding) {
                        if(doge.arenaScore < min) {
                            min = doge.arenaScore;
                        }
                        if(doge.arenaScore > max) {
                            max = doge.arenaScore;
                        }
                    }
                }
            }
        }
    }

    // DETAILS OF TOKEN
    function getTokenDetails(uint256 id) public view returns (ShibaWarsEntity.Doge memory){
        return _tokenDetails[id];
    }

    // SETS STATS OF NEW DOGE AND MINTS
    function mintNFT(address owner, uint tokenId) public isShibaWars(msg.sender) {
        uint multiplier = ShibaWarsUtils.getStatsMultiplier(tokenId);

        (uint str, uint agi, uint dex) = (tokenId < 17) ?
            (multiplier.mul(10).add(abi.encodePacked(block.difficulty, block.timestamp).random(0, 6).mul(multiplier)),
            multiplier.mul(10).add(abi.encodePacked(tokenId, block.timestamp).random(0, 6).mul(multiplier)),
            multiplier.mul(10).add(abi.encodePacked(block.difficulty, tokenId).random(0, 6).mul(multiplier))) :
            (multiplier, multiplier, multiplier); 

        mint(owner, tokenId, str, agi, dex);
    }

    // LEVEL UP DOGE
    function levelUp(uint256 id) public isSeason() {
        ShibaWarsEntity.Doge memory _shiba = _tokenDetails[id];
        // level up if enough shiba treats
        require(shibaTreats[msg.sender] >= ShibaWarsUtils.levelUpCost(_shiba.level), "Shiba Wars: NOT ENOUGH POWER TREATS TO UPGRADE THIS SHIBA");
        // only can level up doges
        require(ShibaWarsUtils.isDoge(_shiba.tokenId), "Shiba Wars: ONLY DOGES CAN BE LEVELLED UP");
        shibaTreats[msg.sender] = shibaTreats[msg.sender].sub(ShibaWarsUtils.levelUpCost(_shiba.level));
        ++_tokenDetails[id].level;
        _tokenDetails[id].strength += _shiba.strengthGain;
        _tokenDetails[id].hitPoints = ShibaWarsUtils.getMaxHp(_shiba.strength + _shiba.strengthGain);
        _tokenDetails[id].agility += _shiba.agilityGain;
        _tokenDetails[id].dexterity += _shiba.dexterityGain;
    }

    // OPEN LUCKY DOGE PACK
    function openPack(uint256 id, address caller) public isShibaWars(msg.sender) isOwner(id, caller) {
        // open pack
        // burn the token
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

    // SET SCORE FOR DOGE
    function setScore(uint256 id, uint score) public isShibaWars(msg.sender) {
        _tokenDetails[id].arenaScore = score;
    }

    // FEED YOUR SHIBA
    function feed(uint256 id) public isSeason() {
        ShibaWarsEntity.Doge memory doge = _tokenDetails[id];
        uint treatTokensNeeded = ShibaWarsUtils.getMaxHp(doge.strength).sub(doge.hitPoints);
        uint256 userTreats = shibaTreats[msg.sender];
        require(treatTokensNeeded > 0, "Shiba Wars: This Shiba is not hungry");
        require(userTreats >= treatTokensNeeded, "Shiba Wars: Not enough treat tokens to feed this Shiba");
        shibaTreats[msg.sender] = userTreats.sub(treatTokensNeeded);
        _tokenDetails[id].hitPoints = ShibaWarsUtils.getMaxHp(doge.strength);
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

}
