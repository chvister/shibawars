pragma solidity ^0.8.0;

import "./ShibaWarsEntity.sol";

interface IShibaWars {

    function ownerOf(uint256 tokenId) external view returns (address owner);

    function getTokenDetails(uint256 id) external view returns (ShibaWarsEntity.Shiba memory);

    function putInArena(uint256 id) external;

    function decreaseHp(uint256 id, uint damage) external;

    function addSCore(uint256 id, uint score) external;

    function mintNFT(address owner, uint tokenId) external;

    function openPack(uint256 id, address caller) external;

}