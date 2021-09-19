pragma solidity ^0.8.0;

// SPDX-License-Identifier: UNLICENSED
library ShibaWarsUtils {
    // token ids
    uint256 constant LUCKY_SHIBA_PACK_GEN_1 = 100;
    uint256 constant SHIBAWARS_SUPPORTER = 101;
    uint256 constant TEAM_OP_SHIBA = 102;
    uint256 constant WOOFMEISTER = 103;
    uint256 constant SHIBA_WHALE = 104;
    uint256 constant OG_SHIBA = 105;
    uint256 constant SHIBA_WARLORD = 106;
    uint256 constant SHIBA_WARRIOR = 107;
    uint256 constant DOGE_KILLER = 108;
    uint256 constant AGGRESIVE_SHIBA_INU = 109;
    uint256 constant BORED_SHIBA_INU = 110;
    uint256 constant SHIBA_INU = 111;
    uint256 constant AGGRESIVE_SHIBA_PUP = 112;
    uint256 constant SHIBA_PUP = 113;
    uint256 constant DOGE_FATHER = 114;
    uint256 constant FLOKI = 115;
    uint256 constant RYOSHI = 116;
    uint256 constant SHIBA_GENERAL = 117;
    uint256 constant SHIBA_MAGE = 118;
    uint256 constant EXCLUSIVE_SHIBA = 119;

    uint256 constant IRON = 1;
    uint256 constant SILVER = 2;
    uint256 constant GOLDEN = 3;
    uint256 constant DIAMOND = 4;

    uint256 constant MILLION = 10**6;
    uint256 constant THOUSAND = 10**3;
    uint256 constant TOKEN = 10**18;

    function getStatsMultiplier(uint256 tokenId) public pure returns (uint256) {
        if (tokenId == TEAM_OP_SHIBA) {
            return 1000;
        } else if (tokenId == WOOFMEISTER) {
            return 300;
        } else if (tokenId == SHIBA_WHALE) {
            return 200;
        } else if (tokenId == OG_SHIBA) {
            return 175;
        } else if (tokenId == SHIBA_WARLORD) {
            return 150;
        } else if (tokenId == SHIBA_WARRIOR) {
            return 125;
        } else if (tokenId == SHIBA_MAGE) {
            return 125;
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
        } else if (tokenId == EXCLUSIVE_SHIBA) {
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

    function getTrainerTokenReward(uint256 tokenId)
        public
        pure
        returns (uint256)
    {
        if (tokenId == WOOFMEISTER) {
            return 200000;
        } else if (tokenId == DOGE_KILLER) {
            return 400;
        } else if (tokenId == AGGRESIVE_SHIBA_INU) {
            return 200;
        } else if (tokenId == BORED_SHIBA_INU) {
            return 100;
        } else if (tokenId == SHIBA_INU) {
            return 20;
        } else if (tokenId == AGGRESIVE_SHIBA_PUP) {
            return 10;
        } else if (tokenId == SHIBA_PUP) {
            return 3;
        } else if (tokenId == SHIBAWARS_SUPPORTER) {
            return 1;
        } else if (tokenId == DOGE_FATHER) {
            return 20000;
        } else if (tokenId == RYOSHI) {
            return 2250;
        } else if (tokenId == FLOKI) {
            return 500;
        }
        return 0;
    }

    function breeds(uint256 tokenId) public pure returns (uint256) {
        if (tokenId == TEAM_OP_SHIBA) {
            return 3;
        } else if (tokenId == WOOFMEISTER) {
            return 32;
        } else if (tokenId == SHIBA_WHALE) {
            return 48;
        } else if (tokenId == OG_SHIBA) {
            return 3456;
        } else if (tokenId == SHIBA_WARLORD) {
            return 8820;
        } else if (tokenId == SHIBA_WARRIOR) {
            return 11340;
        } else if (tokenId == DOGE_KILLER) {
            return 1200;
        } else if (tokenId == AGGRESIVE_SHIBA_INU) {
            return 1200;
        } else if (tokenId == BORED_SHIBA_INU) {
            return 480;
        } else if (tokenId == SHIBA_INU) {
            return 480;
        } else if (tokenId == AGGRESIVE_SHIBA_PUP) {
            return 480;
        } else if (tokenId == SHIBA_PUP) {
            return 480;
        } else if (tokenId == DOGE_FATHER) {
            return 96;
        } else if (tokenId == RYOSHI) {
            return 216;
        } else if (tokenId == FLOKI) {
            return 24000;
        } else if (tokenId == SHIBA_GENERAL) {
            return 144;
        } else if (tokenId == EXCLUSIVE_SHIBA) {
            return 10000;
        } else if (tokenId == SHIBA_MAGE) {
            return 5400;
        }
        return 1;
    }

    function millions(uint256 count) private pure returns (uint256) {
        return count * MILLION;
    }

    function thousand(uint256 count) private pure returns (uint256) {
        return count * THOUSAND;
    }

    function tokens(uint256 count) private pure returns (uint256) {
        return count * TOKEN;
    }

    function getTokenPrice(uint256 tokenId) public pure returns (uint256) {
        if (tokenId == DOGE_KILLER) {
            return tokens(millions(200));
        } else if (tokenId == AGGRESIVE_SHIBA_INU) {
            return tokens(millions(100));
        } else if (tokenId == BORED_SHIBA_INU) {
            return tokens(millions(50));
        } else if (tokenId == SHIBA_INU) {
            return tokens(millions(10));
        } else if (tokenId == AGGRESIVE_SHIBA_PUP) {
            return tokens(millions(5));
        } else if (tokenId == SHIBA_PUP) {
            return tokens(millions(15) / 10);
        } else if (tokenId == LUCKY_SHIBA_PACK_GEN_1) {
            return tokens(millions(15));
        } else if (tokenId == SHIBAWARS_SUPPORTER) {
            return tokens(thousand(500));
        }
        return 0;
    }

    function getTokenPriceTrainerTokens(uint256 tokenId)
        public
        pure
        returns (uint256)
    {
        if (tokenId == DOGE_KILLER) {
            return 800;
        } else if (tokenId == AGGRESIVE_SHIBA_INU) {
            return 400;
        } else if (tokenId == BORED_SHIBA_INU) {
            return 200;
        } else if (tokenId == SHIBA_INU) {
            return 40;
        } else if (tokenId == AGGRESIVE_SHIBA_PUP) {
            return 20;
        } else if (tokenId == SHIBA_PUP) {
            return 6;
        } else if (tokenId == LUCKY_SHIBA_PACK_GEN_1) {
            return 60;
        } else if (tokenId == SHIBAWARS_SUPPORTER) {
            return 2;
        }
        return 0;
    }

    function getTokenPriceFloki(uint256 tokenId) public pure returns (uint256) {
        if (tokenId == DOGE_KILLER) {
            return tokens(millions(35));
        } else if (tokenId == AGGRESIVE_SHIBA_INU) {
            return tokens(millions(175) / 10);
        } else if (tokenId == BORED_SHIBA_INU) {
            return tokens(millions(875) / 100);
        } else if (tokenId == SHIBA_INU) {
            return tokens(millions(175) / 100);
        } else if (tokenId == AGGRESIVE_SHIBA_PUP) {
            return tokens(thousand(875));
        } else if (tokenId == SHIBA_PUP) {
            return tokens(thousand(2625) / 10);
        } else if (tokenId == LUCKY_SHIBA_PACK_GEN_1) {
            return tokens(thousand(2625));
        } else if (tokenId == SHIBAWARS_SUPPORTER) {
            return tokens(thousand(875) / 10);
        }
        return 0;
    }

    function getTokenPriceLeash(uint256 tokenId) public pure returns (uint256) {
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
            tokenId = ShibaWarsUtils.BORED_SHIBA_INU;
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

    function isShiba(uint256 id) public pure returns (bool) {
        return id / 100 == 1 && id > 101;
    }

    function isLeash(uint256 id) public pure returns (bool) {
        return id / 100 == 0;
    }

    function getMaxHp(uint64 strength) public pure returns (uint256) {
        return (uint64)(strength * 5 + 5000);
    }

    // COST OF LEVEL UP IN POWER TREATS
    function levelUpCost(uint256 level) public pure returns (uint256) {
        return level * 150000;
    }
}
