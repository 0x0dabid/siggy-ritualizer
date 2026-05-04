// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract SiggyRitualizer is ERC721URIStorage {
    uint256 public nextTokenId = 1;

    event PfpMinted(address indexed minter, uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("Siggy Ritualizer", "SIGGY") {}

    function mint(string memory tokenURI) public returns (uint256) {
        uint256 tokenId = nextTokenId;
        nextTokenId += 1;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        emit PfpMinted(msg.sender, tokenId, tokenURI);
        return tokenId;
    }
}
