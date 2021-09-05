pragma solidity ^0.8.0;

library ShibaWarsUtils {

    // token ids
    uint constant LUCKY_SHIBA_PACK_GEN_1 = 100;
    uint constant SHIBAWARS_SUPPORTER = 101;
    uint constant BOJAR_DA_KILLA = 102;
    uint constant KAYA_THE_WOLFMOTHER = 103;
    uint constant WOOFMEISTER = 104;
    uint constant SHIBA_WHALE = 105;
    uint constant OG_SHIBA = 106;
    uint constant SHIBA_WARLORD = 107;
    uint constant SHIBA_WARRIOR = 108;
    uint constant DOGE_KILLER = 109;
    uint constant AGGRESIVE_SHIBA_INU = 110;
    uint constant BORED_SHIBA_INU = 111;
    uint constant SHIBA_INU = 112;
    uint constant AGGRESIVE_SHIBA_PUP = 113;
    uint constant SHIBA_PUP = 114;
    uint constant DOGE_FATHER = 115;
    uint constant FLOKI = 116;
    uint constant RYOSHI = 117;
    uint constant SHIBA_GENERAL = 118;

    uint constant IRON = 1;
    uint constant SILVER = 2;
    uint constant GOLDEN = 3;
    uint constant DIAMOND = 4;

    uint constant MILLION = 10 ** 6;
    uint constant THOUSAND = 10 ** 3;
    uint constant TOKEN = 10 ** 18;

    function getStatsMultiplier(uint tokenId) public pure returns (uint) {
        if (tokenId == BOJAR_DA_KILLA || tokenId == KAYA_THE_WOLFMOTHER) {
            return 1000;
        } else if (tokenId == WOOFMEISTER) {
            return 300;
        } else if (tokenId == SHIBA_WHALE) {
            return 225;
        } else if (tokenId == OG_SHIBA) {
            return 200;
        } else if (tokenId == SHIBA_WARLORD) {
            return 175;
        } else if (tokenId == SHIBA_WARRIOR) {
            return 150;
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
            return 250;
        } else if (tokenId == RYOSHI) {
            return 225;
        } else if (tokenId == FLOKI) {
            return 200;
        } else if (tokenId == SHIBA_GENERAL) {
            return 200;
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
        } else if (tokenId == LUCKY_SHIBA_PACK_GEN_1) {
            return tokens(millions(4));
        } else if (tokenId == SHIBAWARS_SUPPORTER) {
            return tokens(millions(15) / 10);
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
            // golden shiba inu
            tokenId = ShibaWarsUtils.FLOKI;
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

    function isShiba(uint id) public pure returns (bool) {
        return id / 100 == 1 && id > 101;
    }

    function isLeash(uint id) public pure returns (bool) {
        return id / 100 == 0;
    }

    function getMaxHp(uint64 strength) public pure returns(uint) {
        return (uint64)(strength * 5 + 5000);
    }
    
    // COST OF LEVEL UP IN POWER TREATS
    function levelUpCost(uint level) public pure returns (uint) {
        return level * 150000;
    }

}
