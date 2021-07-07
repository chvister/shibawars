pragma solidity ^0.8.0;

import "./IShibaInu.sol";
import "./ShibaMath.sol";
import "./IShibaWars.sol";
import "./ShibaWarsUtils.sol";

contract ShibaWarsFactory {

    using ShibaMath for uint;
    using ShibaMath for bytes;

    address constant shibaInu = 0xAC27f67D1D2321FBa609107d41Ff603c43fF6931;
    address immutable shibaWars;

    address private devAddress;

    uint256 private arenaReward;
    uint256 private matchmakerReward;
    uint256 private devReward;
    uint256 private burnAmount;

    constructor(address shibaWars_) {
        devAddress = msg.sender;
        shibaWars = shibaWars_;
    }
    
    // RETURN TOTAL PRIZE POOL TO BE WON BY PLAYERS
    function getPrizePool() public view returns (uint256) {
        return IShibaInu(shibaInu).balanceOf(address(this)).sub(matchmakerReward);
    }

    // RETURN REWARD FOR CREATING MATCHES
    function getMatchMakerReward() public view returns (uint256) {
        uint256 divisor = IShibaWars(shibaWars).getArenaQueueLength().max(1);
        return matchmakerReward.div(divisor);
    }

    // SEND DEV REWARD AND BURNS BURN AMOUNT
    function redeemDevReward() public {
        IShibaInu _shibaInu = IShibaInu(shibaInu);
        // burn shib
        _shibaInu.burn(burnAmount);
        // pay the dev
        _shibaInu.transfer(devAddress, devReward);
    }

    function payTheContract(uint256 cost) public {
        address factory = address(this);
        IShibaInu _shibaInu = IShibaInu(shibaInu);
        require(cost > 0, "Shiba Wars: THIS TOKEN CAN NOT BE BOUGHT");
        // does the buyer has enough shib?
        require(_shibaInu.balanceOf(msg.sender) >= cost, "Shiba Wars: INSUFFICIENT SHIB BALANCE");
        require(_shibaInu.allowance(msg.sender, factory) >= cost, "Shiba Wars: ALLOW US TO SPEND YOUR SHIB");
        // transfer shib from buyer to smart contract
        require(_shibaInu.transferFrom(msg.sender, factory, cost), "Shiba Wars: Can not transfer tokens to the smart contract");
        (uint256 _burn, uint256 _mmkr, uint256 _dev, uint256 _arena) = getFees(cost);
        arenaReward = arenaReward.add(_arena);
        matchmakerReward = matchmakerReward.add(_mmkr);
        devReward = devReward.add(_dev);
        burnAmount = burnAmount.add(_burn);
    }

    function payMatchmaker(address matchmaker) public {
        require(msg.sender == shibaWars, "Shiba Wars: ONLY ARENA CAN PAY MATCHMAKER");
        uint256 reward = getMatchMakerReward();
        matchmakerReward = matchmakerReward.sub(reward);
        IShibaInu(shibaInu).transfer(matchmaker, reward);
    }

    function getFees(uint256 cost) public pure returns (uint256 _burn, uint256 _mmkr, uint256 _dev, uint256 _arena) {
        //25% burn
        _burn = cost.ratio(25, 100);
        // 3% to matchmaking
        _mmkr = cost.ratio(3, 100);
        // 22% to dev
        _dev = cost.ratio(22, 100);
        // rest to arena winners
        _arena = cost.sub(_burn).sub(_mmkr).sub(_dev);
    }

    // BUY DOGE FROM SHOP
    function buyShiba(uint tokenId) public {
        payTheContract(ShibaWarsUtils.getTokenPrice(tokenId));
        IShibaWars(shibaWars).mintNFT(msg.sender, tokenId);
    }

    // BUY SHIBA TREAT TOKENS
    function buyTreats() public {
        payTheContract(150000 * 10 ** 18);
        IShibaWars(shibaWars).addTreats(msg.sender, 1500000);
    } 

    // OPEN LUCKY DOGE PACK
    function openPack(uint256 id) public {
        IShibaWars _shibaWars = IShibaWars(shibaWars);
        // open pack
        // burn the token
        _shibaWars.openPack(id, msg.sender);
        // mint random token
        uint tokenId = ShibaWarsUtils.getRandomId(abi.encodePacked(block.difficulty, block.timestamp).random(0, 10000));
        _shibaWars.mintNFT(msg.sender, tokenId);
    }


}