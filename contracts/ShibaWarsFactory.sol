pragma solidity ^0.8.0;

import "./IShibaInu.sol";
import "./ShibaMath.sol";
import "./IShibaWars.sol";
import "./ShibaWarsUtils.sol";

contract ShibaWarsFactory {

    using ShibaMath for uint;
    using ShibaMath for bytes;

    IShibaInu constant shibaInu = IShibaInu(0xAC27f67D1D2321FBa609107d41Ff603c43fF6931);
    IShibaWars private shibaWars;

    address private devAddress;

    uint256 private matchmakerReward;

    constructor(address shibaWars_) {
        devAddress = msg.sender;
        shibaWars = IShibaWars(shibaWars_);
    }
    
    // RETURN TOTAL PRIZE POOL TO BE WON BY PLAYERS
    function getPrizePool() public view returns (uint256) {
        return shibaInu.balanceOf(address(this)).sub(matchmakerReward);
    }

    // RETURN REWARD FOR CREATING MATCHES
    function getMatchMakerReward() public view returns (uint256) {
        return matchmakerReward;
    }

    // BUY DOGE FROM SHOP
    function buyShiba(uint tokenId) public {
        uint256 cost = ShibaWarsUtils.getTokenPrice(tokenId);
        require(cost > 0, "Shiba Wars: THIS TOKEN CAN NOT BE BOUGHT");
        // does the buyer has enough shib?
        require(shibaInu.balanceOf(msg.sender) >= cost, "Shiba Wars: INSUFFICIENT SHIB BALANCE");
        require(shibaInu.allowance(msg.sender, address(this)) >= cost, "Shiba Wars: ALLOW US TO SPEND YOUR SHIB");
        // transfer shib from buyer to smart contract
        require(shibaInu.transferFrom(msg.sender, address(this), cost), "Shiba Wars: Can not transfer tokens to the smart contract");
        // burn shib
        shibaInu.burn(cost.div(4));
        // send shib to deployer
        require(shibaInu.transfer(devAddress, cost.div(4)),"Shiba Wars: Can not send to dev");
        // 3% to matchmaking
        matchmakerReward += cost.ratio(3, 100);

        shibaWars.mintNFT(msg.sender, tokenId);
    }

    // OPEN LUCKY DOGE PACK
    function openPack(uint256 id) public {
        // open pack
        // burn the token
        shibaWars.openPack(id, msg.sender);
        // mint random token
        uint number = abi.encodePacked(block.difficulty, block.timestamp).random(0, 10000);
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
        shibaWars.mintNFT(msg.sender, tokenId);
    }


}