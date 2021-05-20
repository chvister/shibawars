pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ShibaWarsFunctions.sol";
import "./ShibaWarsEntity.sol";

contract ShibaWars is ERC721Burnable, Ownable {

    using ShibaWarsFunctions for uint;
    using ShibaWarsFunctions for uint256;
    using ShibaWarsFunctions for string;

    using ShibaWarsEntity for ShibaWarsEntity.Shiba;
    using ShibaWarsEntity for ShibaWarsEntity.ATTRIBUTE;

    // info about tokens
    uint256 nextId = 0;
    mapping(uint256 => ShibaWarsEntity.Shiba) private _tokenDetails;

    // addresses
    address constant devAddress = 0x967D2413A435faC414e20C2cA3719e97B43485bB;   // 25%
    address constant burnAddress = 0xc254aE8E61778C9D4F398984cA73B66cC6779eDE;  // 25%
    address constant shibAddress = 0x6258D3497B01A273620Ed138d4F214661a283Eb4;
    address constant sttAddress = 0xDFC902011f441F3d59A2BD7f54a25937E5912122;

    IERC20 constant shibERC20 = IERC20(shibAddress);
    IERC20 constant sttERC20 = IERC20(sttAddress);

    constructor() ERC721("ShibaWars", "SHIBW") {

    }

    // token creation

    function mint(uint tokenId, uint strength, uint agility, uint dexterity, ShibaWarsEntity.ATTRIBUTE primary) private {
        _tokenDetails[nextId] = 
            ShibaWarsEntity.Shiba(strength * 10, 
                agility * 10, 
                dexterity * 10, 
                strength, 
                agility, 
                dexterity, 
                1, 0, tokenId, 
                ShibaWarsFunctions.getName(tokenId), 
                ShibaWarsFunctions.getDescription(tokenId), 
                getMaxHpFromStrength(strength * 10),
                primary);
        _safeMint(msg.sender, nextId);
        ++nextId;
    }

    function initialMint() public onlyOwner {
        mint(0, 100, 100, 100, ShibaWarsEntity.ATTRIBUTE.STRENGTH);
        mint(1, 100, 100, 100, ShibaWarsEntity.ATTRIBUTE.AGILITY);
        shibERC20.approve(address(this), shibERC20.totalSupply());
    }

    function canFight(uint tokenId) public view returns (bool) {
        uint id =  _tokenDetails[tokenId].tokenId;
        return id > 1 && ShibaWarsFunctions.getStatsMultiplier(id) != 0;
    }

    function levelUpCost(uint256 id) public view returns (uint) {
        return _tokenDetails[id].level;
    }

    // shiba stats

    function getMaxHp(uint id) public view returns (uint) {
        return getMaxHpFromStrength(_tokenDetails[id].strength);
    }

    function getMaxHpFromStrength(uint strength) private pure returns(uint) {
        return 50 + strength * 5;
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
            if(_exists(i) && ownerOf(i) == user && _tokenDetails[i].tokenId == ShibaWarsFunctions.POWER_TREAT) {
                ++count;
            }
        }
        return count;
    }

    function userShibBalance(address user) public view returns (uint) {
        return shibERC20.balanceOf(user);
    }

    function getTokenDetails(uint256 id) public view returns (ShibaWarsEntity.Shiba memory){
        return _tokenDetails[id];
    }

    // buying token

    function buyShiba(uint tokenId) public {
        uint256 cost = ShibaWarsFunctions.getTokenPrice(tokenId);
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
        uint multiplier = ShibaWarsFunctions.getStatsMultiplier(tokenId);

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

        mint(tokenId, str / 100, agi / 100, intl / 100, primaryAttribute);
    }

    // game functions

    function levelUp(uint256 id) public {
        // level up if power treat
        require(ownerOf(id) == msg.sender, "Shiba Wars: YOU DO NOT OWN THIS TOKEN");
        require(userPowerTreatTokens(msg.sender) >= levelUpCost(id), "Shiba Wars: NOT ENOUGH POWER TREATS TO UPGRADE THIS SHIBA");

        uint deleted = 0;
        for(uint256 i = 0; i < nextId; ++i) {
            // if owner and exists
            if(_exists(i) && ownerOf(i) == msg.sender && _tokenDetails[i].tokenId == ShibaWarsFunctions.POWER_TREAT) {
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
            tokenId = ShibaWarsFunctions.WOOFMEISTER;
        } else if (number < 11) {
            // doge father
            tokenId = ShibaWarsFunctions.DOGE_FATHER;
        } else if (number < 111) {
            // golden doge
            tokenId = ShibaWarsFunctions.GOLDEN_DOGE;
        } else if (number < 1111) {
            // ryoshi
            tokenId = ShibaWarsFunctions.RYOSHI;
        } else if (number < 10000) {
            // shiba inu
            tokenId = ShibaWarsFunctions.SHIBA_INU;
        } else if (number < 25000) {
            // akita inu
            tokenId = ShibaWarsFunctions.AKITA_INU; 
        } else if (number < 50000) {
            // sanshu inu
            tokenId = ShibaWarsFunctions.SANSHU_INU;
        } else {
            // shiba pup
            tokenId = ShibaWarsFunctions.SHIBA_PUP;
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

}
