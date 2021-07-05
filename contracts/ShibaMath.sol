pragma solidity ^0.8.0;

library ShibaMath {

    function add(uint a, uint b) external pure returns (uint) {
        require (a + b > a || a == 0 || b == 0, "ADD: Math Error");
        return a + b; 
    }

    function sub(uint a, uint b) external pure returns (uint) {
        require (a >= b, "SUB: Math Error");
        return a - b;
    }

    function mul(uint a, uint b) external pure returns (uint out) {
        if(a == 0 || b == 0) {
            return 0;
        }
        out = a * b;
        require(out / b == a, "MUL: Math Error");
        return out;
    }

    function div(uint a, uint b) external pure returns (uint out) {
        require (b != 0, "DIV: Math Error");
        return a / b;
    }

    function ratio(uint number, uint share, uint max) external pure returns (uint) {
        require(max != 0, "RATIO: Zero division");
        require(max >= share, "RATIO: Max is greater than shares");
        (uint a, uint b) = (number * max, number * (max - share)); 
        require(a >= b, "RATIO: Math Error");
        return (a - b) / max;
    }

    // random between min inclusive and max inclusive
    function random(bytes memory seed_, uint min_, uint max_) external pure returns (uint) {
        (uint a, uint b) = min_ > max_ ? (max_, min_) : (min_, max_);
        require(b > 0, "RAND: Zero interval");
        return (uint(keccak256(seed_)) % (b + 1 - a)) + a;
    }

    function min(uint a, uint b) external pure returns (uint) {
        return a > b ? b : a;
    }

}