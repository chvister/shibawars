pragma solidity ^0.8.0;

import "./ShibaWarsEntity.sol";

// SPDX-License-Identifier: UNLICENSED
interface IShibaWars {
    function ownerOf(uint256 tokenId) external view returns (address owner);

    function getTokenDetails(uint256 id)
        external
        view
        returns (ShibaWarsEntity.Shiba memory);

    function setInArena(uint256 id, uint16 inArena) external;

    function decreaseHp(uint256 id, uint256 damage) external;

    function setScore(uint256 id, uint128 score) external;

    function mintNFT(address owner, uint256 tokenId) external returns (uint256);

    function recycle(uint256 id, address caller) external;

    function addTreats(address user, uint256 count) external;

    function getSeasonStart() external view returns (uint256);

    function getWinners()
        external
        view
        returns (uint256[] memory winners, uint256[] memory scores);

    function setMaxScore(uint256 id, uint128 score) external;
}
