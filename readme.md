# solcasm (evm-assembler)

[![Build Status](https://travis-ci.com/RafaelSalguero/pureutils.svg?branch=master)](https://travis-ci.com/RafaelSalguero/pureutils)

## `solc --asm` compatible assembler

1.- Write EVM assembly in the same format as `solc`

```evm
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
stop

sub_0: assembly {
      mstore(0x40, 0x80)
}
```

2.- Compile it
```
npx solcasm contract.evm contract.bin
```