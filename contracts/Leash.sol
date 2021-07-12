pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract Leash is ERC20Burnable {

    constructor() ERC20("DOGE KILLER", "LEASH") {
        _mint(msg.sender, 107646 * 10 ** 18);
    }

}