import { toHexCode } from "./compiler";
import { opCodes } from "./opcodes";
import { constantByteSize, pushConstant, reduceOpSpaces, tokenize } from "./tokenizer";
import { op } from "./test-helper";
import { Constant, HexToken, OpCode, OpCodeName, Token } from "./types";

test("labelRef", () => {
    const actual = toHexCode(`
dup1
label_0
dup1
label_0:
dup1
dup1
    `);

    const expected: HexToken[] = [
        op("dup1"),
        ...pushConstant("0x04"),
        op("dup1"),
        op("jumpdest"),
        op("dup1"),
        op("dup1"),
    ];

    expect(actual).toEqual(expected);
});

test("labelSize", () => {
    const actual = toHexCode(`
dup1
dataSize(label_0)
dup2
label_0: assembly {
    dup3
    label_1:
    dup4
    label_1
}
dup5
    `);

    const expected: HexToken[] = [
        op("dup1"),
        ...pushConstant("0x05"),
        op("dup2"),
        op("dup3"),
        op("jumpdest"),
        op("dup4"),
        ...pushConstant("0x01"),
        op("dup5"),
    ];

    expect(actual).toEqual(expected);
});