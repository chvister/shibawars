pragma solidity ^0.8.0;

library ShibaWarsEntity {

    enum ATTRIBUTE { STRENGTH, AGILITY, DEXTERITY }

    struct Shiba {
        uint id;            // uinque id of token

        uint strength;      // HP, armor
        uint agility;       // evasion, crit chance
        uint dexterity;     // aim, crit chance decrease

        uint strengthGain;  // strength gain per level
        uint agilityGain;   // agility gain per level
        uint dexterityGain; // dexterity gain per level

        uint level;         // level
        uint arenaScore;    // score in arena

        uint tokenId;       // id of shiba    
        string name;        // name
        string description; // description

        uint hitPoints;     // hitpoints
        ATTRIBUTE primary;   // 1 - strength, 2- agility, 3- dexterity
    }

}