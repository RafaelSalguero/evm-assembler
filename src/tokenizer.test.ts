import { opCodes } from "./opcodes";
import { constantByteSize, pushConstant, tokenize } from "./tokenizer";
import { Constant, HexToken, OpCode, OpCodeName } from "./types";

const op = (op: OpCodeName): OpCode => ({
    type: "op",
    hex: opCodes[op],
    size: constantByteSize(opCodes[op]),
    name: op
});


test("simple ops", () => {
    const actual = tokenize(`
    push1
    push1
    mstore
    `);

    const expected: OpCode[] = [
        op("push1"),
        op("push1"),
        op("mstore"),
    ];

    expect(expected).toEqual(actual);
});

test("op consts", () => {
    const actual = tokenize(`
    0x80
    0x40
    mstore
    `);

    const expected: HexToken[] = [
        ...pushConstant("0x80"),
        ...pushConstant("0x40"),
        op("mstore"),
    ];

    expect(expected).toEqual(actual);
});

test("op call", () => {
    const actual = tokenize(`
    mstore(0x40, 0x80)
    `);

    const expected: HexToken[] = [
        ...pushConstant("0x80"),
        ...pushConstant("0x40"),
        op("mstore"),
    ];

    expect(expected).toEqual(actual);
});