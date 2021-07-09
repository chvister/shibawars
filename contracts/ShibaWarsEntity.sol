pragma solidity ^0.8.0;

library ShibaWarsEntity {

    struct Doge {
        uint256 id;            // uinque id of token

        uint64 strength;      // HP, armor
        uint64 agility;       // evasion, crit chance
        uint64 dexterity;     // aim, crit chance decrease

        uint32 tokenId;       // id of shiba    
        uint32 inArena;         // 0 false 1 true

        uint64 strengthGain;  // strength gain per level
        uint64 agilityGain;   // agility gain per level
        uint64 dexterityGain; // dexterity gain per level

        uint64 level;         // level

        uint256 arenaScore;    // score in arena
        uint256 hitPoints;     // hitpoints
        
    }
    
}