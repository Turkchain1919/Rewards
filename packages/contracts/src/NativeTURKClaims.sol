// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;
import {NativeRewardVault} from "./NativeRewardVault.sol";
/// @notice Legacy constructor alias; new installations can configure their EIP-712 name/version.
contract NativeTURKClaims is NativeRewardVault {
 constructor(address owner_,address signer_) NativeRewardVault(owner_,signer_,"Turkchain Social Rewards","1") {}
}
