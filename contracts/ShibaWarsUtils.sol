pragma solidity ^0.8.0;

library ShibaWarsUtils {

    // token ids
    uint constant BOJAR_DA_KILLA = 0;
    uint constant KAYA_THE_WOLFMOTHER = 1;
    uint constant WOOFMEISTER = 2;
    uint constant SHIBA_WHALE = 3;
    uint constant OG_SHIBA = 4;
    uint constant SHIBA_WARLORD = 5;
    uint constant SHIBA_GENERAL = 6;
    uint constant DOGE_KILLER = 7;
    uint constant AGGRESIVE_SHIBA_INU = 8;
    uint constant BORED_SHIBA_INU = 9;
    uint constant SHIBA_INU = 10;
    uint constant AGGRESIVE_SHIBA_PUP = 11;
    uint constant SHIBA_PUP = 12;
    uint constant LUCKY_DOGE_PACK_GEN_1 = 13;
    uint constant DOGE_FATHER = 14;
    uint constant GOLDEN_DOGE = 15;
    uint constant RYOSHI = 16;

    uint constant IRON = 17;
    uint constant SILVER = 18;
    uint constant GOLDEN = 19;
    uint constant DIAMOND = 20;

    uint constant MILLION = 10 ** 6;
    uint constant THOUSAND = 10 ** 3;
    uint constant TOKEN = 10 ** 18;

    function getStatsMultiplier(uint tokenId) public pure returns (uint) {
        if (tokenId == BOJAR_DA_KILLA || tokenId == KAYA_THE_WOLFMOTHER) {
            return 1000;
        } else if (tokenId == WOOFMEISTER) {
            return 400;
        } else if (tokenId == SHIBA_WHALE) {
            return 250;
        } else if (tokenId == OG_SHIBA) {
            return 225;
        } else if (tokenId == SHIBA_WARLORD) {
            return 200;
        } else if (tokenId == SHIBA_GENERAL) {
            return 175;
        } else if (tokenId == DOGE_KILLER) {
            return 200;
        } else if (tokenId == AGGRESIVE_SHIBA_INU) {
            return 180;
        } else if (tokenId == BORED_SHIBA_INU) {
            return 160;
        } else if (tokenId == SHIBA_INU) {
            return 140;
        } else if (tokenId == AGGRESIVE_SHIBA_PUP) {
            return 120;
        } else if (tokenId == SHIBA_PUP) {
            return 100;
        } else if (tokenId == DOGE_FATHER) {
            return 275;
        } else if (tokenId == RYOSHI) {
            return 250;
        } else if (tokenId == GOLDEN_DOGE) {
            return 225;
        } else if (tokenId == IRON) {
            return 15;
        } else if (tokenId == SILVER) {
            return 20;
        } else if (tokenId == GOLDEN) {
            return 25;
        } else if (tokenId == DIAMOND) {
            return 30;
        }
        return 0;
    }

    function millions(uint count) private pure returns (uint) {
        return count * MILLION;
    }

    function thousand(uint count) private pure returns (uint) {
        return count * THOUSAND;
    }

    function tokens(uint count) private pure returns (uint) {
        return count * TOKEN;
    }

    function getTokenPrice(uint tokenId) public pure returns (uint256) {
        if (tokenId == DOGE_KILLER) {
            return tokens(millions(100));
        } else if (tokenId == AGGRESIVE_SHIBA_INU) {
            return tokens(millions(20));
        } else if (tokenId == BORED_SHIBA_INU) {
            return tokens(millions(10));
        } else if (tokenId == SHIBA_INU) {
            return tokens(millions(5));
        } else if (tokenId == AGGRESIVE_SHIBA_PUP) {
            return tokens(millions(25) / 10);
        } else if (tokenId == SHIBA_PUP) {
            return tokens(thousand(500));
        } else if (tokenId == LUCKY_DOGE_PACK_GEN_1) {
            return tokens(millions(4));
        }
        return 0;
    }

    function getTokenPriceLeash(uint tokenId) public pure returns (uint256) {
        if (tokenId == IRON) {
            return tokens(1) / 100;
        } else if (tokenId == SILVER) {
            return tokens(1) / 10;
        } else if (tokenId == GOLDEN) {
            return tokens(1);
        } else if (tokenId == DIAMOND) {
            return tokens(10);
        }
        return 0;
    }

    function getRandomId(uint256 number) public pure returns (uint256 tokenId) {
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
            tokenId = ShibaWarsUtils.AGGRESIVE_SHIBA_INU;
        } else if (number < 3000) {
            // akita inu
            tokenId = ShibaWarsUtils.SHIBA_INU; 
        } else if (number < 5500) {
            // sanshu inu
            tokenId = ShibaWarsUtils.AGGRESIVE_SHIBA_PUP;
        } else {
            // shiba pup
            tokenId = ShibaWarsUtils.SHIBA_PUP;
        }
    }

    function isDoge(uint id) public pure returns (bool) {
        return id >= 0 && id < 17 && id != 13;
    }

    function isLeash(uint id) public pure returns (bool) {
        return id >= 17;
    }

    function getMaxHp(uint64 strength) public pure returns(uint) {
        return (uint64)(strength * 5 + 5000);
    }
    
    // COST OF LEVEL UP IN POWER TREATS
    function levelUpCost(uint level) public pure returns (uint) {
        return level * 150000;
    }

}
