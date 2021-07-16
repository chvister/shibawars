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
    uint constant WATCHDOG = 7;
    uint constant DOGE_KILLER = 8;
    uint constant SHIBA_INU = 9;
    uint constant AKITA_INU = 10;
    uint constant SANSHU_INU = 11;
    uint constant SHIBA_PUP = 12;
    uint constant LUCKY_DOGE_PACK_GEN_1 = 13;
    uint constant DOGE_FATHER = 14;
    uint constant GOLDEN_DOGE = 15;
    uint constant RYOSHI = 16;

    uint constant IRON = 17;
    uint constant SILVER = 18;
    uint constant GOLDEN = 19;
    uint constant DIAMOND = 20;

    function getStatsMultiplier(uint tokenId) public pure returns (uint) {
        if (tokenId == BOJAR_DA_KILLA || tokenId == KAYA_THE_WOLFMOTHER) {
            return 1000;
        } else if (tokenId == WOOFMEISTER) {
            return 400;
        } else if (tokenId == SHIBA_WHALE) {
            return 225;
        } else if (tokenId == OG_SHIBA) {
            return 200;
        } else if (tokenId == SHIBA_WARLORD) {
            return 175;
        } else if (tokenId == SHIBA_GENERAL) {
            return 150;
        } else if (tokenId == WATCHDOG) {
            return 200;
        } else if (tokenId == DOGE_KILLER) {
            return 180;
        } else if (tokenId == SHIBA_INU) {
            return 160;
        } else if (tokenId == AKITA_INU) {
            return 140;
        } else if (tokenId == SANSHU_INU) {
            return 120;
        } else if (tokenId == SHIBA_PUP) {
            return 100;
        } else if (tokenId == DOGE_FATHER) {
            return 250;
        } else if (tokenId == RYOSHI) {
            return 225;
        } else if (tokenId == GOLDEN_DOGE) {
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
        return count * 10 ** 6;
    }

    function thousand(uint count) private pure returns (uint) {
        return count * (10 ** 3);
    }

    function tokens(uint count) private pure returns (uint) {
        return count * (10 ** 18);
    }

    function getTokenPrice(uint tokenId) public pure returns (uint256) {
        if (tokenId == WATCHDOG) {
            return tokens(millions(100));
        } else if (tokenId == DOGE_KILLER) {
            return tokens(millions(20));
        } else if (tokenId == SHIBA_INU) {
            return tokens(millions(10));
        } else if (tokenId == AKITA_INU) {
            return tokens(millions(5));
        } else if (tokenId == SANSHU_INU) {
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
    }

}
