pragma solidity ^0.8.0;

library ShibaMath {

    function add(uint256 a, uint256 b) external pure returns (uint256) {
        require (a + b > a || a == 0 || b == 0, "ADD: Math Error");
        return a + b; 
    }

    function sub(uint256 a, uint256 b) external pure returns (uint256) {
        require (a >= b, "SUB: Math Error");
        return a - b;
    }

    function mul(uint256 a, uint256 b) external pure returns (uint out) {
        if(a == 0 || b == 0) {
            return 0;
        }
        out = a * b;
        require(out / b == a, "MUL: Math Error");
        return out;
    }

    function div(uint256 a, uint256 b) external pure returns (uint256 out) {
        require (b != 0, "DIV: Math Error");
        return a / b;
    }

    function ratio(uint256 number, uint256 share, uint256 max) external pure returns (uint256) {
        require(max != 0, "RATIO: Zero division");
        require(max >= share, "RATIO: Max is greater than shares");
        (uint256 a, uint256 b) = (number * max, number * (max - share)); 
        require(a >= b, "RATIO: Math Error");
        return (a - b) / max;
    }

    // random between min inclusive and max inclusive
    function random(bytes memory seed_, uint256 min_, uint256 max_) external pure returns (uint256) {
        (uint256 a, uint256 b) = min_ > max_ ? (max_, min_) : (min_, max_);
        require(b > 0, "RAND: Zero interval");
        return (uint256(keccak256(seed_)) % (b + 1 - a)) + a;
    }

    function min(uint256 a, uint256 b) external pure returns (uint256) {
        return a > b ? b : a;
    }

}