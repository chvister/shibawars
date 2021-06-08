pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract ShibaTreatToken is ERC20, Ownable {

    constructor(address shibaWarsAddress) ERC20("Shiba Treat Token", "STT") {
        _mint(shibaWarsAddress, 1000000000000000);
    }

    function transferOwnership(address newOwner) public virtual override onlyOwner {
        super.transferOwnership(newOwner);
    }

    function decimals() public view virtual override returns (uint8) {
        return 0;
    }

}