pragma solidity ^0.8.0;

import "./IERC20.sol";
import "./ShibaMath.sol";
import "./IShibaWars.sol";
import "./IShibaWarsArena.sol";
import "./ShibaWarsUtils.sol";

contract ShibaWarsFactory {

    using ShibaMath for uint;
    using ShibaMath for bytes;

    address constant shibaInu = 0xAC27f67D1D2321FBa609107d41Ff603c43fF6931;
    address constant leash = 0x70bE14767cC790a668BCF6d0E6B4bC815A1bCf05;
    IShibaWars immutable shibaWars;
    IShibaWarsArena immutable shibaWarsArena;

    address private devAddress;

    // shib
    uint256 private winnersReward;
    uint256 private matchmakingReward;
    uint256 private devReward;
    uint256 private burnAmount;
    // leash
    uint256 private winnersRewardLeash;
    uint256 private matchmakingRewardLeash;
    uint256 private devRewardLeash;
    uint256 private burnAmountLeash;

    uint256 constant SEASON_DURATION = 90 * 24 * 60 * 60;
    bytes32 constant merkleRoot = 0x3ec34dbb7ba6997c3cc877559af6f99873409a96f669760d4f24b17c0e75a49b;
    mapping(address => bool) private airdropClaimed;
    mapping(address => bool) private prizeClaimed;

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

    modifier isDev(address caller) {
        require(caller == devAddress, "SHIBAWARS: CALLER IS NOT A DEV");
        _;
    }

    modifier isUser() {
        require (msg.sender == tx.origin, "SHIBAWARS: CAN NOT BE CALLED BY A SMART CONTRACT!");
        _;
    }

    constructor(address _shibaWars, address _arena) {
        devAddress = msg.sender;
        shibaWars = IShibaWars(_shibaWars);
        shibaWarsArena = IShibaWarsArena(_arena);
    }
    
    // RETURN TOTAL PRIZE POOL TO BE WON BY PLAYERS
    function getPrizePool() public view returns (uint256) {
        return winnersReward.add(matchmakingReward);
    }

    // RETURN TOTAL PRIZE POOL LEASH TO BE WON BY PLAYERS
    function getPrizePoolLeash() public view returns (uint256) {
        return winnersRewardLeash.add(matchmakingRewardLeash);
    }

    // SEND DEV REWARD AND BURN BURN AMOUNT
    function redeemDevReward() public {
        IERC20 _shibaInu = IERC20(shibaInu);
        // burn shib
        _shibaInu.transfer(0xdEAD000000000000000042069420694206942069, burnAmount);
        burnAmount = 0;
        // pay the dev
        _shibaInu.transfer(devAddress, devReward.min(_shibaInu.balanceOf(address(this))));
        devReward = 0;
        IERC20 _leash = IERC20(leash);
        // burn leash 
        _leash.transfer(0xdEAD000000000000000042069420694206942069, burnAmountLeash);
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
        (uint256 _burn, uint256 _dev, uint256 _matchmaking, uint256 _winners) = getFees(cost);
        winnersReward = winnersReward.add(_winners);
        matchmakingReward = matchmakingReward.add(_matchmaking);
        devReward = devReward.add(_dev);
        burnAmount = burnAmount.add(_burn);
    }

    function donateShib(uint256 amount) public {
        address factory = address(this);
        IERC20 _shibaInu = IERC20(shibaInu);
        require(amount > 0, "Shiba Wars: AMOUNT MSUT BE ABOVE ZERO");
        // does the buyer has enough shib?
        require(_shibaInu.balanceOf(msg.sender) >= amount, "Shiba Wars: INSUFFICIENT SHIB BALANCE");
        require(_shibaInu.allowance(msg.sender, factory) >= amount, "Shiba Wars: ALLOW US TO SPEND YOUR SHIB");
        // transfer shib from buyer to smart contract
        require(_shibaInu.transferFrom(msg.sender, factory, amount), "Shiba Wars: Can not transfer tokens to the smart contract");
        uint256 _matchmaking = amount.div(2);
        uint256 winners = amount.sub(_matchmaking);
        matchmakingReward = matchmakingReward.add(_matchmaking);
        winnersReward = winnersReward.add(winners);
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
        (uint256 _burn, uint256 _dev, uint256 _matchmaking, uint256 _winners) = getFees(cost);
        winnersRewardLeash = winnersRewardLeash.add(_winners);
        matchmakingRewardLeash = matchmakingRewardLeash.add(_matchmaking);
        devRewardLeash = devRewardLeash.add(_dev);
        burnAmountLeash = burnAmountLeash.add(_burn);
    }

    function getFees(uint256 cost) public pure returns (uint256 _burn, uint256 _dev, uint256 _matchmaking, uint256 _winners) {
        // 25% burn
        _burn = cost.ratio(25, 100);
        // 25% to dev
        _dev = cost.ratio(25, 100);
        // 25% to the arena
        _matchmaking = cost.ratio(25, 100);
        // rest to arena winners
        _winners = cost.sub(_burn).sub(_dev).sub(_matchmaking);
    }

    function airdropGeneral(address user) public isDev(msg.sender) {
        shibaWars.mintNFT(user, ShibaWarsUtils.SHIBA_GENERAL);
    }

    function airdropBadge(address user) public isDev(msg.sender) {
        shibaWars.mintNFT(user, ShibaWarsUtils.SHIBAWARS_SUPPORTER);
    }

    // BUY SHIBA FROM SHOP
    function buyShiba(uint tokenId) public isSeason() isUser() {
        payTheContract(ShibaWarsUtils.getTokenPrice(tokenId));
        shibaWars.mintNFT(msg.sender, tokenId);
    }

    // BUY LEASH FROM SHOP
    function buyLeash(uint tokenId) public isSeason() isUser() {
        payTheContractLeash(ShibaWarsUtils.getTokenPriceLeash(tokenId));
        shibaWars.mintNFT(msg.sender, tokenId);
    }

    // BUY SHIBA TREAT TOKENS
    function buyTreats(uint count) public isSeason() {
        payTheContract(count.mul(10 ** 17));
        shibaWars.addTreats(msg.sender, count);
    } 

    // OPEN LUCKY SHIBA PACK
    // we will prevent calling this function from smart contracts
    function openPack(uint256 id) public isUser() {
        // open pack
        // burn the token
        shibaWars.openPack(id, msg.sender);
        // mint random token
        uint tokenId = ShibaWarsUtils.getRandomId(abi.encodePacked(block.difficulty, block.timestamp, id).random(0, 10000));
        shibaWars.mintNFT(msg.sender, tokenId);
    }

    function endSeason() public seasonEnded() {
        // get top 10
        (uint256[] memory winners, uint256[] memory scores) = shibaWars.getWinners();
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
        shares[0] = 26000;
        shares[1] = 20000;
        shares[2] = 15000;
        shares[3] = 12000;
        shares[4] = 9000;
        shares[5] = 7000;
        shares[6] = 4000;
        shares[7] = 3000;
        shares[8] = 2000;
        shares[9] = 1000;
        uint lastTotal = 26000;
        uint lastIndex = 0;
        uint lastCount = 1;
        // this will divide shares between winners if multiple have same score
        for(uint i = 1; i < 11; ++i) {
            if(i!= 10 && scores[i] == scores[i - 1]) {
                lastTotal += shares[i];
                ++lastCount;
            } else {
                for(uint j = 0; j < lastCount; ++j) {
                    shares[lastIndex + j] = lastTotal.div(lastCount);
                }
                if(i != 10) {
                    lastTotal = shares[i];
                    lastIndex = i;
                    lastCount = 1;
                }
            }
        }
        uint prizepool = winnersReward;
        uint prizepoolLeash = winnersRewardLeash;
        for(uint i = 0; i < 10; ++i) {
            address winner = shibaWars.ownerOf(winners[i]);
            uint prizeShib = prizepool.ratio(shares[i], 100000);
            uint prizeLeash = prizepoolLeash.ratio(shares[i], 100000);
            IERC20(shibaInu).transfer(winner, prizeShib);
            IERC20(leash).transfer(winner, prizeLeash);
        }
        redeemDevReward();
    }

    function claimPrize() public seasonEnded() {
        require(!prizeClaimed[msg.sender], "SHIBAWARS: PRIZE CLAIMED ALREADY!");
        (uint256 _matchesWon, uint256 _totalMatches) = shibaWarsArena.getMatchesWon(msg.sender);
        uint256 shibPrize = matchmakingReward.ratio(_matchesWon, _totalMatches.mul(10));
        uint256 leashPrize = matchmakingRewardLeash.ratio(_matchesWon, _totalMatches.mul(10));
        IERC20(shibaInu).transfer(msg.sender, shibPrize);
        IERC20(leash).transfer(msg.sender, leashPrize);
        prizeClaimed[msg.sender] = true;
    }

    function claimablePrize(address user) public view returns (uint256 _shib, uint256 _leash) {
        if(prizeClaimed[user]){
            _shib = 0;
            _leash = 0;
        } else {
            (uint256 _matchesWon, uint256 _totalMatches) = shibaWarsArena.getMatchesWon(msg.sender);
            _shib = matchmakingReward.ratio(_matchesWon, _totalMatches.mul(10));
            _leash = matchmakingRewardLeash.ratio(_matchesWon, _totalMatches.mul(10));
        }
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
        shibaWars.mintNFT(msg.sender, tokenId);
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