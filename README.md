![](cover.png)

# Damn Vulnerable DeFi V3 Solutions

The [`v3.0.0-solutions`](https://github.com/mikle97pir/damn-vulnerable-defi-solutions/tree/v3.0.0-solutions) branch of this repository contains my solutions to the [Damn Vulnerable DeFi V3](https://damnvulnerabledefi.xyz) challenges. All solutions have a JavaScript part located in the [`test`](https://github.com/mikle97pir/damn-vulnerable-defi-solutions/tree/v3.0.0-solutions/test) folder. Some of them also include an attacker smart contract at [`contracts/player-contracts`](https://github.com/mikle97pir/damn-vulnerable-defi-solutions/tree/v3.0.0-solutions/contracts/player-contracts). There are decent walkthroughs available for the previous version of Damn Vulnerable DeFi (e.g. [this one](https://github.com/0xJuancito/damn-vulnerable-defi-solutions) by [0xJuancito](https://github.com/0xJuancito)), so I will write here only about the new stuff. However, there are comments in the code for all the problems.

## Table of Contents

1. [Unstoppable](#1-unstoppable)
2. [Naive receiver](#2-naive-receiver)
3. [Truster](#3-truster)
4. [Side Entrance](#4-side-entrance)
5. [The Rewarder](#5-the-rewarder)
6. [Selfie](#6-selfie)
7. [Compromised](#7-compromised)
8. [Puppet](#8-puppet)
9. [Puppet V2](#9-puppet-v2)
10. [Free Rider](#10-free-rider)
11. [Backdoor](#11-backdoor)
12. [Climber](#12-climber)
13. [Wallet Mining](#13-wallet-mining)
14. [Puppet V3](#14-puppet-v3)
15. [ABI Smuggling](#15-abi-smuggling)

---

### **1. Unstoppable**

no important changes since V2

Javascript: [test/unstoppable/unstoppable.challenge.js](https://github.com/mikle97pir/damn-vulnerable-defi-solutions/blob/v3.0.0-solutions/test/unstoppable/unstoppable.challenge.js)

### **2. Naive receiver**

no important changes since V2

Javascript: [test/naive-receiver/naive-receiver.challenge.js](https://github.com/mikle97pir/damn-vulnerable-defi-solutions/blob/v3.0.0-solutions/test/naive-receiver/naive-receiver.challenge.js)

### **3. Truster**

no important changes since V2

Javascript: [test/truster/truster.challenge.js](https://github.com/mikle97pir/damn-vulnerable-defi-solutions/blob/v3.0.0-solutions/test/truster/truster.challenge.js)

### **4. Side Entrance**

no important changes since V2

Javascript: [test/side-entrance/side-entrance.challenge.js](https://github.com/mikle97pir/damn-vulnerable-defi-solutions/blob/v3.0.0-solutions/test/side-entrance/side-entrance.challenge.js)

Attacker smart contract: [contracts/player-contracts/SideEntranceAttacker.sol](https://github.com/mikle97pir/damn-vulnerable-defi-solutions/blob/v3.0.0-solutions/contracts/player-contracts/SideEntranceAttacker.sol)

### **5. The Rewarder**

no important changes since V2

Javascript: [test/the-rewarder/the-rewarder.challenge.js](https://github.com/mikle97pir/damn-vulnerable-defi-solutions/blob/v3.0.0-solutions/test/the-rewarder/the-rewarder.challenge.js)

Attacker smart contract: [contracts/player-contracts/TheRewarderAttacker.sol](https://github.com/mikle97pir/damn-vulnerable-defi-solutions/blob/v3.0.0-solutions/contracts/player-contracts/TheRewarderAttacker.sol)

### **6. Selfie**

no important changes since V2

Javascript: [test/selfie/selfie.challenge.js](https://github.com/mikle97pir/damn-vulnerable-defi-solutions/blob/v3.0.0-solutions/test/selfie/selfie.challenge.js)

Attacker smart contract: [contracts/player-contracts/SelfieAttacker.sol](https://github.com/mikle97pir/damn-vulnerable-defi-solutions/blob/v3.0.0-solutions/contracts/player-contracts/SelfieAttacker.sol)

### **7. Compromised**

no important changes since V2

Javascript: [test/compromised/compromised.challenge.js](https://github.com/mikle97pir/damn-vulnerable-defi-solutions/blob/v3.0.0-solutions/test/compromised/compromised.challenge.js)
### **8. Puppet**

In V3, the Puppet challenge can be solved in one transaction since the token used in the challenge is now compliant with the [ERC-2612](https://eips.ethereum.org/EIPS/eip-2612) standard. This standard introduces a `permit` function that enables users to change the allowance at the token on behalf of someone else using a precooked signature. Therefore, an extra transaction to call `approve` is not needed.

Javascript: [test/puppet/puppet.challenge.js](https://github.com/mikle97pir/damn-vulnerable-defi-solutions/blob/v3.0.0-solutions/test/puppet/puppet.challenge.js)

Attacker smart contract: [contracts/player-contracts/PuppetAttacker.sol](https://github.com/mikle97pir/damn-vulnerable-defi-solutions/blob/v3.0.0-solutions/contracts/player-contracts/PuppetAttacker.sol)
### **9. Puppet V2**

no important changes since V2

Javascript: [test/puppet-v2/puppet-v2.challenge.js](https://github.com/mikle97pir/damn-vulnerable-defi-solutions/blob/v3.0.0-solutions/test/puppet-v2/puppet-v2.challenge.js)

Attacker smart contract: [contracts/player-contracts/PuppetV2Attacker.sol](https://github.com/mikle97pir/damn-vulnerable-defi-solutions/blob/v3.0.0-solutions/contracts/player-contracts/PuppetV2Attacker.sol)

### **10. Free Rider**

no important changes since V2

Javascript: [test/free-rider/free-rider.challenge.js](https://github.com/mikle97pir/damn-vulnerable-defi-solutions/blob/v3.0.0-solutions/test/free-rider/free-rider.challenge.js)

Attacker smart contract: [contracts/player-contracts/FreeRiderAttacker.sol](https://github.com/mikle97pir/damn-vulnerable-defi-solutions/blob/v3.0.0-solutions/contracts/player-contracts/FreeRiderAttacker.sol)

### **11. Backdoor**

no important changes since V2

Javascript: [test/backdoor/backdoor.challenge.js](https://github.com/mikle97pir/damn-vulnerable-defi-solutions/blob/v3.0.0-solutions/test/backdoor/backdoor.challenge.js)

Attacker smart contract: [contracts/player-contracts/BackdoorAttacker.sol](https://github.com/mikle97pir/damn-vulnerable-defi-solutions/blob/v3.0.0-solutions/contracts/player-contracts/BackdoorAttacker.sol)

### **12. Climber**

no important changes since V2

Javascript: [test/climber/climber.challenge.js](https://github.com/mikle97pir/damn-vulnerable-defi-solutions/blob/v3.0.0-solutions/test/climber/climber.challenge.js)

Attacker smart contract: [contracts/player-contracts/ClimberAttacker.sol](https://github.com/mikle97pir/damn-vulnerable-defi-solutions/blob/v3.0.0-solutions/contracts/player-contracts/ClimberAttacker.sol)

Sure, here is an improved version of that part:

### **13. Wallet Mining**

A good walkthrough for the Wallet Mining challenge is available on [Medium](https://systemweakness.com/damn-vulnerable-defi-v3-13-wallet-mining-solution-d5147533fa49) by [@bowenzby](https://medium.com/@bowenzby).

This challenge is a replay attack that is similar to [what happened](https://mirror.xyz/0xbuidlerdao.eth/lOE5VN-BHI0olGOXe27F0auviIuoSlnou_9t3XRJseY) on Optimism. If you're tempted to read the solution, I advise you to read that story first and try again.

You will need to enter a Mainnet RPC URL into the [`wallet-mining.challenge.js`](https://github.com/mikle97pir/damn-vulnerable-defi-solutions/blob/v3.0.0-solutions/test/wallet-mining/wallet-mining.challenge.js) file.

Javascript: [test/wallet-mining/wallet-mining.challenge.js](https://github.com/mikle97pir/damn-vulnerable-defi-solutions/blob/v3.0.0-solutions/test/wallet-mining/wallet-mining.challenge.js)

Attacker smart contract: [contracts/player-contracts/WalletMiningAttacker.sol](https://github.com/mikle97pir/damn-vulnerable-defi-solutions/blob/v3.0.0-solutions/contracts/player-contracts/WalletMiningAttacker.sol)

### 14. **Puppet V3**

This is a price manipultation attack similar to the previous Puppets. The main difference is that the price is time averaged, so it is necessary to wait a little after selling the tokens.

Javascript: [test/puppet-v3/puppet-v3.challenge.js](https://github.com/mikle97pir/damn-vulnerable-defi-solutions/blob/v3.0.0-solutions/test/puppet-v3/puppet-v3.challenge.js)

Attacker smart contract: [contracts/player-contracts/PuppetV3Attacker.sol](https://github.com/mikle97pir/damn-vulnerable-defi-solutions/blob/v3.0.0-solutions/contracts/player-contracts/PuppetV3Attacker.sol)

### 15. **ABI Smuggling**

There is a very good [walkthrough](https://medium.com/@mattaereal/damnvulnerabledefi-abi-smuggling-challenge-walkthrough-plus-infographic-7098855d49a) on Medium by [@mattaereal](https://medium.com/@mattaereal).

Javascript: [test/abi-smuggling/abi-smuggling.challenge.js](https://github.com/mikle97pir/damn-vulnerable-defi-solutions/blob/v3.0.0-solutions/test/abi-smuggling/abi-smuggling.challenge.js)
## Disclaimer

All Solidity code, practices and patterns in this repository are DAMN VULNERABLE and for educational purposes only.

DO NOT USE IN PRODUCTION.
