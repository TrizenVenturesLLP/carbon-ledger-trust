// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract CarbonCreditToken is ERC721, AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    uint256 private _tokenIds;
    
    struct CreditDetails {
        uint256 amount;      // Amount in tCO₂e
        bool isRetired;
        string metadata;
        uint256 issuedAt;
    }
    
    mapping(uint256 => CreditDetails) public credits;
    mapping(uint256 => bool) public retiredCredits;
    
    event CreditIssued(
        uint256 indexed tokenId,
        address indexed to,
        uint256 amount,
        string metadata
    );
    
    event CreditTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to
    );
    
    event CreditRetired(
        uint256 indexed tokenId,
        address indexed owner,
        string reason
    );
    
    constructor() ERC721("CarbonCreditToken", "CCT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
    }
    
    /**
     * @dev Mint a new carbon credit NFT
     * @param to Address to receive the credit
     * @param amount Amount of carbon credits in tCO₂e
     * @param metadata JSON string with credit metadata
     */
    function mintCredit(
        address to,
        uint256 amount,
        string memory metadata
    ) external onlyRole(ISSUER_ROLE) returns (uint256) {
        require(to != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than 0");
        
        _tokenIds++;
        uint256 tokenId = _tokenIds;
        
        _safeMint(to, tokenId);
        
        credits[tokenId] = CreditDetails({
            amount: amount,
            isRetired: false,
            metadata: metadata,
            issuedAt: block.timestamp
        });
        
        emit CreditIssued(tokenId, to, amount, metadata);
        
        return tokenId;
    }
    
    /**
     * @dev Transfer carbon credit to another address
     * @param tokenId Token ID of the credit
     * @param to Recipient address
     */
    function transferCredit(
        uint256 tokenId,
        address to
    ) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(!retiredCredits[tokenId], "Credit is retired");
        require(to != address(0), "Invalid recipient address");
        
        address from = ownerOf(tokenId);
        _transfer(from, to, tokenId);
        
        emit CreditTransferred(tokenId, from, to);
    }
    
    /**
     * @dev Retire a carbon credit permanently
     * @param tokenId Token ID of the credit
     * @param reason Reason for retirement
     */
    function retireCredit(
        uint256 tokenId,
        string memory reason
    ) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(!retiredCredits[tokenId], "Credit already retired");
        
        retiredCredits[tokenId] = true;
        credits[tokenId].isRetired = true;
        
        emit CreditRetired(tokenId, msg.sender, reason);
    }
    
    /**
     * @dev Get credit details
     * @param tokenId Token ID
     */
    function getCreditDetails(uint256 tokenId)
        external
        view
        returns (
            address owner,
            uint256 amount,
            bool retired,
            string memory metadata
        )
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        CreditDetails memory credit = credits[tokenId];
        
        return (
            ownerOf(tokenId),
            credit.amount,
            credit.isRetired,
            credit.metadata
        );
    }
    
    /**
     * @dev Check if credit is retired
     */
    function isRetired(uint256 tokenId) external view returns (bool) {
        return retiredCredits[tokenId];
    }
    
    /**
     * @dev Get total supply
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds;
    }
    
    // Required by AccessControl
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
