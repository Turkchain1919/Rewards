// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;
import {NativeTURKClaims} from "../src/NativeTURKClaims.sol";
interface Vm {
 function addr(uint256) external returns(address);
 function sign(uint256,bytes32) external returns(uint8,bytes32,bytes32);
 function deal(address,uint256) external;
 function prank(address) external;
 function warp(uint256) external;
 function chainId(uint256) external;
 function expectRevert() external;
}
contract NativeTURKClaimsTest {
 Vm constant vm=Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
 NativeTURKClaims vault;
 uint256 constant key=123456789;
 address user;
 function setUp() public {
  user=vm.addr(555);
  vault=new NativeTURKClaims(address(this),vm.addr(key));
  vm.deal(address(vault),100 ether);
 }
 function sig(uint256 amount,uint256 nonce,uint256 deadline) internal returns(bytes memory){
  (uint8 v,bytes32 r,bytes32 s)=vm.sign(key,vault.claimDigest(user,amount,nonce,deadline));
  return abi.encodePacked(r,s,v);
 }
 function testPausedByDefault() public {
  bytes memory signature=sig(1 ether,1,10000);
  vm.expectRevert();vm.prank(user);vault.claim(1 ether,1,10000,signature);
 }
 function testClaimAndReplayDenied() public {
  vault.unpause(); bytes memory signature=sig(1 ether,1,10000);
  vm.prank(user);vault.claim(1 ether,1,10000,signature);
  require(user.balance==1 ether && vault.usedNonces(user,1),"accounting");
  vm.expectRevert();vm.prank(user);vault.claim(1 ether,1,10000,signature);
 }
 function testExpired() public {
  vault.unpause();bytes memory signature=sig(1 ether,1,100);
  vm.warp(101);vm.expectRevert();vm.prank(user);vault.claim(1 ether,1,100,signature);
 }
 function testWrongRecipient() public {
  vault.unpause();bytes memory signature=sig(1 ether,1,10000);
  vm.expectRevert();vault.claim(1 ether,1,10000,signature);
 }
 function testWrongChain() public {
  vault.unpause();bytes memory signature=sig(1 ether,1,10000);
  vm.chainId(block.chainid+1);vm.expectRevert();vm.prank(user);vault.claim(1 ether,1,10000,signature);
 }
 function testWrongVault() public {
  vault.unpause();bytes memory signature=sig(1 ether,1,10000);
  NativeTURKClaims other=new NativeTURKClaims(address(this),vm.addr(key));other.unpause();
  vm.deal(address(other),1 ether);
  vm.expectRevert();vm.prank(user);other.claim(1 ether,1,10000,signature);
 }
 function testInsufficientFundsDoesNotConsumeNonce() public {
  vault.unpause();bytes memory signature=sig(101 ether,1,10000);
  vm.expectRevert();vm.prank(user);vault.claim(101 ether,1,10000,signature);
  require(!vault.usedNonces(user,1),"nonce consumed");
 }
 function testAdminOnly() public {
  vm.expectRevert();vm.prank(user);vault.unpause();
  vm.expectRevert();vm.prank(user);vault.setSigner(user);
 }
 function testSignerRotationInvalidatesOldSignature() public {
  bytes memory signature=sig(1 ether,1,10000);vault.setSigner(vm.addr(987));vault.unpause();
  vm.expectRevert();vm.prank(user);vault.claim(1 ether,1,10000,signature);
 }
 function testFuzzClaim(uint96 amount,uint64 nonce) public {
  if(amount==0)return;vm.deal(address(vault),amount);vault.unpause();
  bytes memory signature=sig(amount,nonce,type(uint256).max);
  vm.prank(user);vault.claim(amount,nonce,type(uint256).max,signature);
  require(user.balance==amount,"amount mismatch");
 }
}
