pragma solidity ^0.8.0;

// SPDX-License-Identifier: UNLICENSED
library ShibaWarsEntity {
    struct Shiba {
        uint256 id; // uinque id of token
        uint256 breed; // breed
        uint64 strength; // HP, armor
        uint64 agility; // evasion, crit chance
        uint64 dexterity; // aim, crit chance decrease
        uint16 power; // % of max power
        uint16 inArena; // 0 false 1 true
        uint32 tokenId; // id of shiba
        uint64 strengthGain; // strength gain per level
        uint64 agilityGain; // agility gain per level
        uint64 dexterityGain; // dexterity gain per level
        uint64 level; // level
        uint128 arenaScore; // score in arena
        uint128 maxScore; // max score in arena
        uint256 hitPoints; // hitpoints
    }
}
