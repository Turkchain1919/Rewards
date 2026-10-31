// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @notice Native EVM reward vault. No mainnet deployment or funding is authorized.
contract NativeRewardVault is EIP712, Ownable2Step, Pausable, ReentrancyGuard {
    bytes32 public constant CLAIM_TYPEHASH = keccak256("Claim(address recipient,uint256 amount,uint256 nonce,uint256 deadline)");
    address public signer;
    mapping(address => mapping(uint256 => bool)) public usedNonces;
    event Claimed(address indexed recipient, uint256 indexed nonce, uint256 amount);
    event SignerChanged(address indexed signer);
    error InvalidClaim();
    error TransferFailed();
    constructor(address owner_, address signer_, string memory domainName_, string memory domainVersion_) EIP712(domainName_, domainVersion_) Ownable(owner_) {
        if (signer_ == address(0)) revert InvalidClaim();
        signer = signer_;
        _pause();
    }
    function claimDigest(address recipient, uint256 amount, uint256 nonce, uint256 deadline) public view returns (bytes32) {
        return _hashTypedDataV4(keccak256(abi.encode(CLAIM_TYPEHASH, recipient, amount, nonce, deadline)));
    }
    function claim(uint256 amount, uint256 nonce, uint256 deadline, bytes calldata signature) external whenNotPaused nonReentrant {
        if (amount == 0 || block.timestamp > deadline || usedNonces[msg.sender][nonce]) revert InvalidClaim();
        if (ECDSA.recover(claimDigest(msg.sender, amount, nonce, deadline), signature) != signer) revert InvalidClaim();
        usedNonces[msg.sender][nonce] = true;
        (bool sent,) = payable(msg.sender).call{value: amount}("");
        if (!sent) revert TransferFailed();
        emit Claimed(msg.sender, nonce, amount);
    }
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
    function setSigner(address next) external onlyOwner whenPaused {
        if (next == address(0)) revert InvalidClaim();
        signer = next;
        emit SignerChanged(next);
    }
    receive() external payable {}
}
