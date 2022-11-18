// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DummyRC20 is ERC20 {
    constructor(
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) {}

    function mint(uint256 _amount) external {
        _mint(msg.sender, _amount);
    }
}