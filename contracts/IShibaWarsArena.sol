pragma solidity ^0.8.0;

// SPDX-License-Identifier: UNLICENSED
interface IShibaWarsArena {
    function getMatchesWon(address account)
        external
        view
        returns (uint256 _matchesWon, uint256 _totalMatches);
}
