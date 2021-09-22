
import { compile } from "./compiler";
import { opCodes } from "./opcodes";
import { constantByteSize, pushConstant, reduceOpSpaces, tokenize } from "./tokenizer";
import { Constant, HexToken, OpCode, OpCodeName, Token } from "./types";

test("full compile", () => {
  const code = `
    /* "src/proxy.sol":123:1084  contract Proxy {... */
        mstore(0x40, 0x80)
        callvalue
        dup1
        iszero
        tag_1
        jumpi
        0x00
        dup1
        revert
      tag_1:
        pop
        dataSize(sub_0)
        dup1
        dataOffset(sub_0)
        0x00
        codecopy
        0x00
        return
      invalid
      
      sub_0: assembly {
              /* "src/proxy.sol":123:1084  contract Proxy {... */
            mstore(0x40, 0x80)
            jumpi(tag_2, calldatasize)
              /* "src/proxy.sol":950:951  0 */
            0x00
            dup1
            dup2
            dup3
            dup4
              /* "src/proxy.sol":864:875  callvalue() */
            callvalue
              /* "src/proxy.sol":804:846  0xA6014eee4c8316f19E89E721a0e46Dd0704201FA */
            0xa6014eee4c8316f19e89e721a0e46dd0704201fa
              /* "src/proxy.sol":744:749  gas() */
            gas
              /* "src/proxy.sol":722:965  call(... */
            call
              /* "src/proxy.sol":979:1040  if eq(result, 0) {... */
            tag_5
            jumpi
              /* "src/proxy.sol":950:951  0 */
            dup1
            dup2
              /* "src/proxy.sol":1014:1026  revert(0, 0) */
            revert
              /* "src/proxy.sol":979:1040  if eq(result, 0) {... */
          tag_5:
              /* "src/proxy.sol":950:951  0 */
            dup1
            dup2
              /* "src/proxy.sol":1054:1066  return(0, 0) */
            return
              /* "src/proxy.sol":123:1084  contract Proxy {... */
          tag_2:
              /* "src/proxy.sol":223:226  0x0 */
            0x00
              /* "src/proxy.sol":228:242  calldatasize() */
            calldatasize
              /* "src/proxy.sol":223:226  0x0 */
            dup2
            dup3
              /* "src/proxy.sol":205:243  calldatacopy(0x0, 0x0, calldatasize()) */
            calldatacopy
              /* "src/proxy.sol":223:226  0x0 */
            dup1
            dup2
              /* "src/proxy.sol":228:242  calldatasize() */
            calldatasize
              /* "src/proxy.sol":223:226  0x0 */
            dup4
            dup5
              /* "src/proxy.sol":357:399  0x3323B6c94847d1Cf98AaE1ac0A1d745d3AF91e5E */
            0x3323b6c94847d1cf98aae1ac0a1d745d3af91e5e
              /* "src/proxy.sol":297:302  gas() */
            gas
              /* "src/proxy.sol":271:525  callcode(... */
            callcode
              /* "src/proxy.sol":539:600  if eq(result, 0) {... */
            tag_5
            jumpi
              /* "src/proxy.sol":223:226  0x0 */
            dup1
            dup2
              /* "src/proxy.sol":574:586  revert(0, 0) */
            revert
      
          auxdata: 0xa164736f6c6343000807000a
      }      
    `;

  const expected = "6080604052348015600f57600080fd5b50606780601d6000396000f3fe6080604052366031576000808182833473a6014eee4c8316f19e89e721a0e46dd0704201fa5af1602d578081fd5b8081f35b6000368182378081368384733323b6c94847d1cf98aae1ac0a1d745d3af91e5e5af2602d578081fdfea164736f6c6343000807000a";
  expect(compile(code)).toEqual(expected);
});
