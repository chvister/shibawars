pragma solidity ^0.8.0;

import "./IERC20.sol";
import "./ShibaMath.sol";
import "./IShibaWars.sol";
import "./ShibaWarsUtils.sol";

contract ShibaWarsFactory {

    using ShibaMath for uint;
    using ShibaMath for bytes;

    address constant shibaInu = 0xAC27f67D1D2321FBa609107d41Ff603c43fF6931;
    address constant leash = 0x70bE14767cC790a668BCF6d0E6B4bC815A1bCf05;
    address immutable shibaWars;

    address private devAddress;

    // shib
    uint256 private arenaReward;
    uint256 private devReward;
    uint256 private burnAmount;
    // leash
    uint256 private arenaRewardLeash;
    uint256 private devRewardLeash;
    uint256 private burnAmountLeash;

    uint256 constant SEASON_DURATION = 90 * 24 * 60 * 60;
    bytes32 constant merkleRoot = 0xb9003ab55e41b13678c60b23e7db03fda67f2696e8b7657295c89c1c58906f2c;
    mapping(address => bool) private airdropClaimed;

    modifier isSeason() {
        require(block.timestamp >= IShibaWars(shibaWars).seasonStart() && block.timestamp <= IShibaWars(shibaWars).seasonStart() + SEASON_DURATION,
            "Shiba Wars: Can only be called during the season!");
        _;
    }

    modifier seasonEnded() {
        require(block.timestamp > IShibaWars(shibaWars).seasonStart() + SEASON_DURATION,
            "Shiba Wars: Can only be called after season has ended!");
        _;
    }

    constructor(address shibaWars_) {
        devAddress = msg.sender;
        shibaWars = shibaWars_;
    }
    
    // RETURN TOTAL PRIZE POOL TO BE WON BY PLAYERS
    function getPrizePool() public view returns (uint256) {
        return IERC20(shibaInu).balanceOf(address(this)).sub(devReward).sub(burnAmount);
    }

    // RETURN TOTAL PRIZE POOL LEASH TO BE WON BY PLAYERS
    function getPrizePoolLeash() public view returns (uint256) {
        return IERC20(leash).balanceOf(address(this)).sub(devRewardLeash).sub(burnAmountLeash);
    }

    // SEND DEV REWARD AND BURN BURN AMOUNT
    function redeemDevReward() public {
        IERC20 _shibaInu = IERC20(shibaInu);
        // burn shib
        _shibaInu.burn(burnAmount);
        burnAmount = 0;
        // pay the dev
        _shibaInu.transfer(devAddress, devReward.min(_shibaInu.balanceOf(address(this))));
        devReward = 0;
        IERC20 _leash = IERC20(leash);
        // burn leash 
        _leash.transfer(0x000000000000000000000000000000000000dEaD, burnAmountLeash);
        burnAmountLeash = 0;
        // pay teh dev
         _leash.transfer(devAddress, devRewardLeash.min(_leash.balanceOf(address(this))));
         devRewardLeash = 0;
    }

    function payTheContract(uint256 cost) public {
        address factory = address(this);
        IERC20 _shibaInu = IERC20(shibaInu);
        require(cost > 0, "Shiba Wars: THIS TOKEN CAN NOT BE BOUGHT");
        // does the buyer has enough shib?
        require(_shibaInu.balanceOf(msg.sender) >= cost, "Shiba Wars: INSUFFICIENT SHIB BALANCE");
        require(_shibaInu.allowance(msg.sender, factory) >= cost, "Shiba Wars: ALLOW US TO SPEND YOUR SHIB");
        // transfer shib from buyer to smart contract
        require(_shibaInu.transferFrom(msg.sender, factory, cost), "Shiba Wars: Can not transfer tokens to the smart contract");
        (uint256 _burn, uint256 _dev, uint256 _arena) = getFees(cost);
        arenaReward = arenaReward.add(_arena);
        devReward = devReward.add(_dev);
        burnAmount = burnAmount.add(_burn);
    }

    function payTheContractLeash(uint256 cost) public {
        address factory = address(this);
        IERC20 _leash = IERC20(leash);
        require(cost > 0, "Shiba Wars: THIS TOKEN CAN NOT BE BOUGHT");
        // does the buyer has enough shib?
        require(_leash.balanceOf(msg.sender) >= cost, "Shiba Wars: INSUFFICIENT LEASH BALANCE");
        require(_leash.allowance(msg.sender, factory) >= cost, "Shiba Wars: ALLOW US TO SPEND YOUR LEASH");
        // transfer leash from buyer to smart contract
        require(_leash.transferFrom(msg.sender, factory, cost), "Shiba Wars: Can not transfer tokens to the smart contract");
        (uint256 _burn, uint256 _dev, uint256 _arena) = getFees(cost);
        arenaRewardLeash = arenaRewardLeash.add(_arena);
        devRewardLeash = devRewardLeash.add(_dev);
        burnAmountLeash = burnAmountLeash.add(_burn);
    }

    function getFees(uint256 cost) public pure returns (uint256 _burn, uint256 _dev, uint256 _arena) {
        // 25% burn
        _burn = cost.ratio(25, 100);
        // 25% to dev
        _dev = cost.ratio(25, 100);
        // rest to arena winners
        _arena = cost.sub(_burn).sub(_dev);
    }

    // BUY DOGE FROM SHOP
    function buyDoge(uint tokenId) public isSeason() {
        payTheContract(ShibaWarsUtils.getTokenPrice(tokenId));
        IShibaWars(shibaWars).mintNFT(msg.sender, tokenId);
    }

    // BUY LEASH FROM SHOP
    function buyLeash(uint tokenId) public isSeason() {
        payTheContractLeash(ShibaWarsUtils.getTokenPriceLeash(tokenId));
        IShibaWars(shibaWars).mintNFT(msg.sender, tokenId);
    }

    // BUY SHIBA TREAT TOKENS
    function buyTreats(uint count) public isSeason() {
        payTheContract(count.div(10).mul(10 ** 18));
        IShibaWars(shibaWars).addTreats(msg.sender, count);
    } 

    // OPEN LUCKY DOGE PACK
    function openPack(uint256 id) public {
        IShibaWars _shibaWars = IShibaWars(shibaWars);
        // open pack
        // burn the token
        _shibaWars.openPack(id, msg.sender);
        // mint random token
        uint tokenId = ShibaWarsUtils.getRandomId(abi.encodePacked(block.difficulty, block.timestamp, id).random(0, 10000));
        _shibaWars.mintNFT(msg.sender, tokenId);
    }

    function endSeason() public seasonEnded() {
        // get top 10
        (uint256[] memory winners, uint256[] memory scores) = IShibaWars(shibaWars).getWinners();
        for(uint i = 0; i < 9; ++i) {
            for(uint j = i + 1; j < 10; ++j) {
                if(scores[i] < scores[j]) {
                    uint tmp = winners[j];
                    winners[j] = winners[i];
                    winners[i] = tmp;
                    tmp = scores[j];
                    scores[j] = scores[i];
                    scores[i] = tmp;
                }
            }
        }
        uint256[] memory shares = new uint256[](10);
        shares[0] = 26;
        shares[1] = 20;
        shares[2] = 15;
        shares[3] = 12;
        shares[4] = 9;
        shares[5] = 7;
        shares[6] = 4;
        shares[7] = 3;
        shares[8] = 2;
        shares[9] = 1;
        uint lastTotal = 26;
        uint lastIndex = 0;
        uint lastCount = 1;
        // this will divide shares between winners if multiple have same score
        for(uint i = 1; i < 11; ++i) {
            if(i!= 10 && scores[i] == scores[i - 1]) {
                lastTotal += shares[i];
                ++lastCount;
            } else {
                for(uint j = 0; j < lastCount; ++j) {
                    shares[lastIndex + j] = lastTotal.mul(10000).div(lastCount);
                }
                if(i != 10) {
                    lastTotal = shares[i];
                    lastIndex = i;
                    lastCount = 1;
                }
            }
        }
        uint prizepool = getPrizePool();
        uint prizepoolLeash = getPrizePoolLeash();
        for(uint i = 0; i < 10; ++i) {
            address winner = IShibaWars(shibaWars).ownerOf(winners[i]);
            uint prizeShib = prizepool.ratio(shares[i], 1000000);
            uint prizeLeash = prizepoolLeash.ratio(shares[i], 1000000);
            IERC20(shibaInu).transfer(winner, prizeShib);
            IERC20(leash).transfer(winner, prizeLeash);
        }
        redeemDevReward();
        // burn whats left
        IERC20(shibaInu).burn(IERC20(shibaInu).balanceOf(address(this)));
        IERC20(leash).transfer(0x000000000000000000000000000000000000dEaD, IERC20(shibaInu).balanceOf(address(this)));
    }

    function hasAirdrop(bytes32[] memory proof, address account, uint8 tokenId) public view returns (bool) {
        return !airdropClaimed[account] && checkProof(proof, getHash(account, tokenId));
    }

    function isAirdropClaimed() public view returns (bool) {
        return airdropClaimed[msg.sender];
    }

    function claimAirdrop(bytes32[] memory proof, uint8 tokenId) public isSeason() {
        require(!airdropClaimed[msg.sender], "Shiba Wars: Airdrop claimed already!");
        require(hasAirdrop(proof, msg.sender, tokenId), "Shiba Wars: Address is not eligible for this airdrop");
        IShibaWars(shibaWars).mintNFT(msg.sender, tokenId);
        airdropClaimed[msg.sender] = true;
    }

    function getHash(address account, uint8 tokenId) public pure returns(bytes32) {
        return keccak256(abi.encodePacked(account, tokenId));
    }

    function checkProof(bytes32[] memory proof, bytes32 hash) private pure returns (bool) {
        bytes32 el;
        bytes32 h = hash;

        for (uint i = 0; i < proof.length; i += 2) {
            el = proof[i];

            bytes32 h1 = keccak256(abi.encodePacked(h, el));
            bytes32 h2 = keccak256(abi.encodePacked(el, h));
            
            if(h1 == proof[i+1]) {
                h = h1;
            } else {
                h = h2;
            }
        }

        return h == merkleRoot;
    }

}