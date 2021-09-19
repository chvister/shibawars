pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

// SPDX-License-Identifier: UNLICENSED
contract ShibaInu is ERC20Burnable {
    constructor() ERC20("Shiba Inu", "SHIB") {
        _mint(msg.sender, 10**15 * 10**18);
    }
}
