pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract FlokiInu is ERC20Burnable {

    constructor() ERC20("FlokiInu", "FLOKI") {
        _mint(msg.sender, 10 ** 12 * 10 ** 18);
    }

}