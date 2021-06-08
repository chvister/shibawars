pragma solidity ^0.8.0;

library ShibaWarsFunctions {

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
    uint constant POWER_TREAT = 17;

    function getName(uint tokenId) public pure returns (string memory)  {
        if (tokenId == BOJAR_DA_KILLA){
            return "Bojar da Killa";
        } else if (tokenId == KAYA_THE_WOLFMOTHER) {
            return "Kaya the Wolf Mother";
        } else if (tokenId == WOOFMEISTER) {
            return "WoofMeister";
        } else if (tokenId == SHIBA_WHALE) {
            return "Shiba Whale";
        } else if (tokenId == OG_SHIBA) {
            return "OG Shiba";
        } else if (tokenId == SHIBA_WARLORD) {
            return "Shiba Warlord";
        } else if (tokenId == SHIBA_GENERAL) {
            return "Shiba General";
        } else if (tokenId == WATCHDOG) {
            return "Watchdog";
        } else if (tokenId == DOGE_KILLER) {
            return "Doge Killer";
        } else if (tokenId == SHIBA_INU) {
            return "Shiba Inu";
        } else if (tokenId == AKITA_INU) {
            return "Akita Inu";
        } else if (tokenId == SANSHU_INU) {
            return "Sanshu Inu";
        } else if (tokenId == SHIBA_PUP) {
            return "Shiba Pup";
        } else if (tokenId == LUCKY_DOGE_PACK_GEN_1) {
            return "Lucky Doge Pack Gen #1";
        } else if (tokenId == DOGE_FATHER) {
            return "Doge Father";
        } else if (tokenId == GOLDEN_DOGE) {
            return "Golden Doge";
        } else if (tokenId == RYOSHI) {
            return "Ryoshi";
        } else if (tokenId == POWER_TREAT) {
            return "Power Treat";
        }
        return "";
    }

    function getDescription(uint tokenId) public pure returns (string memory) {
        if (tokenId == BOJAR_DA_KILLA) {
            return "Altough he's not a Shiba, do not mess with him. The warden of order.";
        } else if (tokenId == KAYA_THE_WOLFMOTHER) {
            return "She may be cute, but she will get you. Beware, she bites.";
        } else if (tokenId == WOOFMEISTER) {
            return "The one who has power over all the dogs. We look up to you and believe in you.";
        } else if (tokenId == SHIBA_WHALE) {
            return "The true holders of the ShibArmy.";
        } else if (tokenId == OG_SHIBA) {
            return "They were here since the beginning. The true loyal ones.";
        } else if (tokenId == SHIBA_WARLORD) {
            return "Altough they may not be recognized, they do lead the ShibArmy forward.";
        } else if (tokenId == SHIBA_GENERAL) {
            return "One bark, and they are in the battle.";
        } else if (tokenId == WATCHDOG) {
            return "This is not a shiba. But a small cute doge needs a big strong DOG to defend it.";
        } else if (tokenId == DOGE_KILLER) {
            return "Put the doge on the leash. Even though the doges hold together, Doge Killer is true to its beliefs.";
        } else if (tokenId == SHIBA_INU) {
            return "Just look at it! How can you not want to own them all?";
        } else if (tokenId == AKITA_INU) {
            return "A copy cat? NO! Just another cute Inu family member!";
        } else if (tokenId == SANSHU_INU) {
            return "Do you even know this one? If you don't, just look at it!";
        } else if (tokenId == SHIBA_PUP) {
            return "AWWWWWWWWWWWWWWWWWW";
        } else if (tokenId == LUCKY_DOGE_PACK_GEN_1) {
            return "Open for a chance to get a very rare Doge, including the WoofMeister themself.";
        } else if (tokenId == DOGE_FATHER) {
            return "A friend should always underestimate your virtues and an enemy overestimate your faults.";
        } else if (tokenId == GOLDEN_DOGE) {
            return "We all are in it. AND THIS ONE IS GOLDEN!";
        } else if (tokenId == RYOSHI) {
            return "The one who took us under their wings. Ryoshi.";
        } else if (tokenId == POWER_TREAT) {
            return "Feed this to your doge to increase its level.";
        }
        return "";
    }

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
        } else if (tokenId == LUCKY_DOGE_PACK_GEN_1) {
            return 0;
        } else if (tokenId == DOGE_FATHER) {
            return 250;
        } else if (tokenId == GOLDEN_DOGE) {
            return 225;
        } else if (tokenId == RYOSHI) {
            return 200;
        } else if (tokenId == POWER_TREAT) {
            return 0;
        }
        return 0;
    }

    function getTokenPrice(uint tokenId) public pure returns (uint256) {
        if (tokenId == WATCHDOG) {
            return 1000000000;
        } else if (tokenId == DOGE_KILLER) {
            return 100000000;
        } else if (tokenId == SHIBA_INU) {
            return 10000000;
        } else if (tokenId == AKITA_INU) {
            return 5000000;
        } else if (tokenId == SANSHU_INU) {
            return 1000000;
        } else if (tokenId == SHIBA_PUP) {
            return 100000;
        } else if (tokenId == LUCKY_DOGE_PACK_GEN_1) {
            return 3000000;
        } else if (tokenId == POWER_TREAT) {
            return 100000;
        }
        return 0;
    }

    function getTokenPriceSTT(uint tokenId) public pure returns (uint256) {
        if(tokenId == POWER_TREAT) {
            return 1000;
        }
        return 0;
    }

    function getDamage(uint minDamage, uint maxDamage) public view returns (uint) {
        return (uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp))) % (maxDamage - minDamage + 1)) + minDamage;
    }

    function hit(uint aim, uint dodge) public view returns (bool) {
        uint aimValue = uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, aim))) % aim;
        uint dodgeValue = uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, dodge))) % dodge;
        return aimValue > dodgeValue;
    }

    function criticalHit(uint critAim, uint critDodge) public view returns (bool) {
        uint aimValue = uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, critAim))) % critAim;
        uint dodgeValue = uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, critDodge))) % (critDodge * 10);
        return aimValue > dodgeValue;
    }

}
